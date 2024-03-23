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
import random

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

def gen_frames():
    while True:
        year = random.randint(2020,2024)
        month = random.randint(1,12)
        day = random.randint(1,31)
        hour = random.randint(0,23)
        minute = random.randint(0,59)
        second = random.randint(0,59)
        mock_date = f"{year:04d}-{month:02d}-{day:02d} {hour:02d}:{minute:02d}:{second:02d}"

        record_person( {
        #"date": datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
        "date": mock_date,
        "gender": random.choice(['Male','Female']),
        "age": random.randint(18,80),
        "timeWatched": random.randint(5,60)
    })

def record_person(person_info):
    collection.insert_one(person_info)
    print(person_info)

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