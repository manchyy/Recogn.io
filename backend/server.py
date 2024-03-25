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
import threading

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
    last_detection_time = None
    data_recorded = False
    display_text = False
    display_text_start_time = None

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

        face_detected = False
        for detection in result[0][0]:
            label = int(detection[1])
            conf = float(detection[2])
                    
            #DETECTION OCCURING
            if conf > 0.76: 
                xmin = int(detection[3] * frame_width)
                ymin = int(detection[4] * frame_height)
                xmax = int(detection[5] * frame_width)
                ymax = int(detection[6] * frame_height)
                bboxes.append([xmin, ymin, xmax,ymax])


                # if last_detection_time is None:
                #     last_detection_time = perf_counter()
                last_detection_time = perf_counter()
                face_detected = True
                elapsed_time = perf_counter() - last_detection_time

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
                data_recorded = False


            metrics.update(start_time, frame)

        #counting 5 seconds when person is not detected, recording data after
        if face_detected is not True:
            if last_detection_time is not None and perf_counter() - last_detection_time >= 5:
                if data_recorded is not True:
                    data_recorded = True
                    #debug purposes, print to console
                    print('date: ',datetime.now().strftime('%Y-%m-%d %H:%M:%S'))
                    print('gender: ',predicted_gender)
                    print('age: ',predicted_age)
                    print('timeWatched: ',last_detection_time-5)
                    record_person(
                        {
                            "date": datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
                            "gender": predicted_gender,
                            "age": predicted_age,
                            "timeWatched": last_detection_time-5
                        }
                    )

                    display_text = True
                    display_text_start_time = perf_counter()

        #notification text to inform when data is recorded
        if display_text:
            cv2.putText(frame, "Data Recorded", (150, 150), cv2.FONT_HERSHEY_TRIPLEX, 5, (0, 0, 255), 2)
            if perf_counter() - display_text_start_time > 2:
                display_text = False

        ret, buffer = cv2.imencode('.jpg', frame)
        frame = buffer.tobytes()
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')

def record_person(person_info):
    collection.insert_one(person_info)
    print('person recorded!')

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