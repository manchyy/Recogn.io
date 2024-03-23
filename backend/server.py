from flask import Flask, render_template, Response, request
import cv2
import numpy as np
from openvino.runtime import Core
from model_api.performance_metrics import PerformanceMetrics
from time import perf_counter
from pymongo import MongoClient
from dotenv import load_dotenv
import os
from datetime import datetime

app = Flask(__name__)
load_dotenv()

uri = os.getenv('MONGO_URI')
client = MongoClient(uri)
db = client['data']
collection = db['data']

try:
    client.admin.command('ping')
    print('Successfully connected to MongoDB!')
except Exception as e:
    print(e)

script_dir = os.path.dirname(os.path.abspath(__file__))
face_path = os.path.join(script_dir, 'models', 'face-detection-retail-0005.xml')
age_gender_path = os.path.join(script_dir, 'models', 'age-gender-recognition-retail-0013.xml')
core = Core() #init openvino
detection_model_xml = face_path
detection_model = core.read_model(model=detection_model_xml)
age_gender_model_xml = age_gender_path
age_gender_model = core.read_model(model=age_gender_model_xml)
device = "CPU"

#face recognition model
compiled_model = core.compile_model(model=detection_model, device_name=device)
#age/gender model
age_model = core.compile_model(model=age_gender_model, device_name=device)

#input/ouput layers
input_layer = compiled_model.input(0)
output_layer = compiled_model.output(0)

input_layer_age_gender = age_model.input(0)
output_layer_age = age_model.output(1) 
output_layer_gender = age_model.output(0) 

cap = cv2.VideoCapture(0)
N,C,H,W = input_layer.shape
metrics = PerformanceMetrics()

def gen_frames():
    face_detection_start_time = None
    data_recorded = False
    no_face_start_time = None
    while True:
        success, frame = cap.read()
        if not success:
            break
        start_time = perf_counter()
        resized_image = cv2.resize(src=frame, dsize=(W,H))
        input_data = np.expand_dims(np.transpose(resized_image, (2,0,1)), 0).astype(np.float32)
        request = compiled_model.create_infer_request()
        request.infer(inputs={input_layer.any_name: input_data})
        result = request.get_output_tensor(output_layer.index).data
        bboxes = []
        frame_height, frame_width = frame.shape[:2]
        for detection in result[0][0]:
            label = int(detection[1])
            conf = float(detection[2])
            if conf > 0.76:
                xmin = int(detection[3] * frame_width)
                ymin = int(detection[4] * frame_height)
                xmax = int(detection[5] * frame_width)
                ymax = int(detection[6] * frame_height)
                bboxes.append([xmin, ymin, xmax,ymax])

                if face_detection_start_time is None: 
                    face_detection_start_time = perf_counter()
                elapsed_time = perf_counter() - face_detection_start_time
                

                # crop detected face from frame and prepare it as input for age-gender model
                #1,3,62,62 in 1,C,H,W format
                face = frame[ymin:ymax, xmin:xmax]
                if face is not None: #possible crash fix?
                    face_input = cv2.resize(face, (input_layer_age_gender.shape[2], input_layer_age_gender.shape[3])) 
                face_input = face_input.transpose((2, 0, 1)).reshape(1, 3, input_layer_age_gender.shape[2], input_layer_age_gender.shape[3]) # Model requires [1,3,H,W]

                # get the age and gender prediction
                age_gender_request = age_model.create_infer_request()
                age_gender_request.infer(inputs={input_layer_age_gender.any_name: face_input})
                age_output = age_gender_request.get_output_tensor(output_layer_age.index).data  # Get the output tensor for age
                #print(age_output)
                predicted_age = age_output[0][0][0][0] * 100  # Extracting the age value correctly
                gender_output = age_gender_request.get_output_tensor(output_layer_gender.index).data  # Get the output tensor for gender
                predicted_gender = "Female" if gender_output[0][0] > gender_output[0][1] else "Male"        


                #blurring the face
                roi = frame[ymin:ymax, xmin:xmax]
                blurred_roi = cv2.GaussianBlur(roi, (155, 155), 0)
                frame[ymin:ymax, xmin:xmax] = blurred_roi
                # Draw the rectangle on the frame
                cv2.rectangle(frame, (xmin, ymin), (xmax, ymax), (255, 255, 255), 10)
                cv2.putText(frame, f"Age: {predicted_age:.1f}, Gender: {predicted_gender}", (xmin, ymin - 5), cv2.FONT_HERSHEY_TRIPLEX, 2, (0, 0, 255), 2)
            
                metrics.update(start_time, frame)

                #data recording method, must be rewritten in the near future
                # if elapsed_time >= 5 and not data_recorded: #i more than 5 seconds have passed and data is not recorded
                #     #TODO recording data
                #     if no_face_start_time is None: #if a face isnt detected, start recording time
                #         no_face_start_time = perf_counter()
                #     else: #if a person is already out of the frame count how long have they been out
                #         no_face_start_time = perf_counter() - no_face_start_time
                #         if no_face_start_time >= 1: #if theyve been out for x seconds record data
                #             record_person(
                #                 {
                #                     "date": datetime.now(),
                #                     "gender": predicted_gender,
                #                     "age": predicted_age,
                #                     "timeWatched": elapsed_time
                #                 }
                #             )
                #             print('Data recorded about the person and sent to DB!')

        ret, buffer = cv2.imencode('.jpg', frame)
        frame = buffer.tobytes()
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')

def record_person(person_info):
    collection.insert_one(person_info)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/video_feed')
def video_feed():
    return Response(gen_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/add_data', methods=['POST'])
def add_data():
    data = request.json #get data from req
    collection.insert_one(data) #inserting data into db 
    return 'Successfuly posted to MongoDB!'

if __name__ == "__main__":
    app.run(debug=True)