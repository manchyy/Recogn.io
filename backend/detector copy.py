import cv2
import numpy as np
from openvino.runtime import Core
from model_api.performance_metrics import PerformanceMetrics
from time import perf_counter
core = Core() #init openvino

detection_model_xml = "models/face-detection-retail-0005.xml"
detection_model = core.read_model(model=detection_model_xml)

age_gender_model_xml = "models/age-gender-recognition-retail-0013.xml"
age_gender_model = core.read_model(model=age_gender_model_xml)

device = "CPU"

#model compilation
face_model = core.compile_model(model=detection_model, device_name=device)
age_model = core.compile_model(model=age_gender_model, device_name=device)

#input&output layers
input_layer = face_model.input(0)
output_layer = face_model.output(0)

cap = cv2.VideoCapture(0)

N,C,H,W = input_layer.shape

metrics = PerformanceMetrics()

while True: 
    start_time = perf_counter()
    ret, frame = cap.read()
    resized_image = cv2.resize(src=frame, dsize=(W,H))
    input_data = np.expand_dims(np.transpose(resized_image, (2,0,1)), 0).astype(np.float32)
    request = face_model.create_infer_request()
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
            cv2.rectangle(frame, (xmin,ymin), (xmax,ymax), (255,255,255), 10)
            cv2.putText(frame, "face", (xmin,ymin-5), cv2.FONT_HERSHEY_TRIPLEX, 2, (0,0,255), 2)
            metrics.update(start_time, frame)
            cv2.imshow('FYP Demo', frame)
            key = cv2.waitKey(1)

            #quitting by pressing Q
            if key in {ord('q'), ord('Q'), 27}:
                cap.release()
                cv2.destroyAllWindows()
                break



