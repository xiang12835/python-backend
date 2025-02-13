#encoding = utf-8
import os, sys
sys.path.append(os.path.abspath(os.path.join(os.path.abspath(__file__), '../')))
sys.path.append(os.path.abspath(os.path.join(os.path.abspath(__file__), '../../')))
sys.path.append(os.path.abspath(os.path.join(os.path.abspath(__file__), '../../../')))

from ..queue import Worker

def deal(data):
    print("recieve data:",data)

if __name__ == "__main__":
    """ test """
    #1.run mongo.py client
    #2.run background.py worker
    
    worker = Worker("follow.friend")
    try:
        worker.register(deal)
        worker.start()
    except KeyboardInterrupt:
        worker.stop()
        print("exited cleanly")
        sys.exit(1)
    except Exception as e:
        print(e)
