import cv2
import numpy as np
from openvino.runtime import Core
from model_api.performance_metrics import PerformanceMetrics
from time import perf_counter

core = Core()  # Init OpenVINO

# Load face detection model
detection_model_xml = "models/face-detection-retail-0005.xml"
detection_model_bin = "models/face-detection-retail-0005.bin"
detection_model = core.read_network(model=detection_model_xml, weights=detection_model_bin)
compiled_detection_model = core.compile_model(model=detection_model, device_name="CPU")
input_layer_detection = compiled_detection_model.input_info[compiled_detection_model.input_names[0]]
output_layer_detection = compiled_detection_model.output_info[compiled_detection_model.output_names[0]]

# Load age-gender recognition model
age_gender_model_xml = "models/age-gender-recognition-retail-0013.xml"
age_gender_model_bin = "models/age-gender-recognition-retail-0013.bin"
age_gender_model = core.read_network(model=age_gender_model_xml, weights=age_gender_model_bin)
compiled_age_gender_model = core.compile_model(model=age_gender_model, device_name="CPU")
input_layer_age_gender = compiled_age_gender_model.input_info[compiled_age_gender_model.input_names[0]]
output_layer_age_gender = compiled_age_gender_model.output_info[compiled_age_gender_model.output_names[0]]

cap = cv2.VideoCapture(0)

while True:
    start_time = perf_counter()
    ret, frame = cap.read()
    if not ret:
        break

    # Perform face detection
    input_data_detection = np.transpose(frame, (2, 0, 1))[np.newaxis, ...]
    request_detection = compiled_detection_model.infer(inputs={input_layer_detection.input_name: input_data_detection})
    detections = request_detection[output_layer_detection.output_name]

    frame_height, frame_width = frame.shape[:2]
    for detection in detections[0][0]:
        confidence = detection[2]
        if confidence > 0.5:
            xmin, ymin, xmax, ymax = map(int, detection[3:7] * np.array([frame_width, frame_height, frame_width, frame_height]))
            face_region = frame[ymin:ymax, xmin:xmax]

            # Preprocess face region for age-gender recognition
            face_resized = cv2.resize(face_region, (62, 62))  # Assuming input shape required by age-gender model is (62, 62)
            face_preprocessed = (face_resized - 127.5) / 127.5  # Normalize

            # Perform age-gender recognition
            input_data_age_gender = {input_layer_age_gender.input_name: [face_preprocessed]}
            request_age_gender = compiled_age_gender_model.infer(inputs=input_data_age_gender)
            age = request_age_gender[output_layer_age_gender.output_name][0][0][0][0] * 100
            gender = "Male" if request_age_gender[output_layer_age_gender.output_name][0][1][0][0] > 0.5 else "Female"

            # Display bounding box and age-gender information
            cv2.rectangle(frame, (xmin, ymin), (xmax, ymax), (0, 255, 0), 2)
            cv2.putText(frame, f"Age: {age:.1f}", (xmin, ymin - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (0, 255, 0), 2)
            cv2.putText(frame, f"Gender: {gender}", (xmin, ymin - 40), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (0, 255, 0), 2)

    # Display the frame
    cv2.imshow("FYP Demo", frame)

    # Quit by pressing 'q'
    if cv2.waitKey(1) & 0xFF in {ord("q"), ord("Q"), 27}:
        break

# Release resources
cap.release()
cv2.destroyAllWindows()
