import cv2
import numpy as np
from openvino.runtime import Core
from model_api.performance_metrics import PerformanceMetrics
from time import perf_counter
core = Core() #init openvino

detection_model_xml = "models/face-detection-retail-0005.xml"
detection_model = core.read_model(model=detection_model_xml)

age_gender_model_xml = "models/zalupa/zalupa2/age-gender-recognition-retail-0013.xml"
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
output_layer_age = age_model.output(1)  # age prediction
output_layer_gender = age_model.output(0)  # gender prediction

cap = cv2.VideoCapture(0)

N,C,H,W = input_layer.shape

metrics = PerformanceMetrics()

while True: 
    start_time = perf_counter()
    ret, frame = cap.read()
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
            
            # crop detected face from frame and prepare it as input for age-gender model
            #1,3,62,62 in 1,C,H,W format
            face = frame[ymin:ymax, xmin:xmax]
            face_input = cv2.resize(face, (input_layer_age_gender.shape[2], input_layer_age_gender.shape[3]))
            face_input = face_input.transpose((2, 0, 1)).reshape(1, 3, input_layer_age_gender.shape[2], input_layer_age_gender.shape[3]) # Model requires [1,3,H,W]
            #print("Input width", input_layer_age_gender.shape[2])
            #print("Input height", input_layer_age_gender.shape[3])

            # get the age and gender prediction
            # age_gender_request = age_model.create_infer_request()
            # age_gender_request.infer(inputs={input_layer_age_gender.any_name: face_input})
            # age = age_gender_request.get_output_tensor(output_layer_age.index).data
            # age = int(age[0][0][0][0]*100)
            # gender = age_gender_request.get_output_tensor(output_layer_gender.index).data
            # gender_str = "F" if gender[0][0] > gender[0][1] else "M"


            # get the age and gender prediction
            age_gender_request = age_model.create_infer_request()
            age_gender_request.infer(inputs={input_layer_age_gender.any_name: face_input})
            age_output = age_gender_request.get_output_tensor(output_layer_age.index).data  # Get the output tensor for age
            print(age_output)
            predicted_age = age_output[0][0][0][0] * 100  # Extracting the age value correctly
            gender_output = age_gender_request.get_output_tensor(output_layer_gender.index).data  # Get the output tensor for gender
            predicted_gender = "Female" if gender_output[0][0] > gender_output[0][1] else "Male"


            cv2.rectangle(frame, (xmin,ymin), (xmax,ymax), (255,255,255), 10)
            cv2.putText(frame, f"Age: {predicted_age:.1f}, Gender: {predicted_gender}", (xmin, ymin - 5), cv2.FONT_HERSHEY_TRIPLEX, 2, (0, 0, 255), 2)
            # cv2.putText(frame, f"Age:{(age)},Gender:{gender_str}", (xmin,ymin-5), cv2.FONT_HERSHEY_TRIPLEX, 2, (0,0,255), 2)
            metrics.update(start_time, frame)
            cv2.imshow('FYP Demo', frame)
            key = cv2.waitKey(1)

            #quitting by pressing Q
            if key in {ord('q'), ord('Q'), 27}:
                cap.release()
                cv2.destroyAllWindows()
                break