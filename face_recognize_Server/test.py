
from deepface import DeepFace
import asyncio
from PIL import Image
im = Image.open("data/1/1.jpg")
print('import success')
# async def task(name, image):
#     print('task'+name)
#     result = DeepFace.verify("data/1/1.jpg", "data/1/"+image+".jpg", model_name = 'VGG-Face', enforce_detection=False)
#     print(result)

# tasks = [asyncio.create_task(task(str(i), i)) for i in range(0,3)]
            
# # Wait for all tasks to complete and get results
# result = asyncio.wait(tasks)
pairs = [
   ["data/1/1.jpg", "data/1/2.jpg"],
   ["data/1/1.jpg", "data/1/3.jpg"],
   ["data/1/1.jpg", "data/aq.png"]
]
result = DeepFace.verify("data/1/2.jpg", "data/1/2.jpg", model_name = 'VGG-Face', enforce_detection=False)
print(int(result['verified']))