# TIP
  Image processing mini project

# How to start
  ## frontend
    ng serve --host \<ip\>
  ## nodejs
    sudo node server.js
  ## mongoose
    mongod
  ## docker trainer
    __build trainer image:____
      run from backend/AI folder__
      sudo docker build . -t trainer:latest__
    __run container:____
      sudo docker run -t -d --name test_trainer -v $(pwd)/data:/AI/data -v $(pwd)/models:/AI/models trainer

# info
  ## nodejs info:
    npm version: 6.4.1
    nodejs versio v8.15.0
    requested libraries: see node_moduels

  ## mongo info:
    MongoDB shell version v3.4.18

  ## python info:
    __running on container____
    version: python3__
    requested libraries: see backend/AI/requirements.txt
