# GoTreeScape
Declarative grammar has becoming an increasingly significant technique for understanding visualization design space. We propose GoTreeScape system to facilitate the navigation and exploration of the vast design space implied by GoTree, a declarative grammar of tree visualizations. To provide users with the design space overview, GoTreeScape utilizes an Encoder-Decoder architecture to project tree visualizations into a 2D landscape, taking into account the  relationships between different design features. Furthermore, GoTreeScape includes an exploratory framework, enabling top-down, bottom-up, and hybrid modes to support the inherently undirected nature of exploratory search. We demonstrate that GoTreeScape can expand the diversity of user-designed tree visualizations through two case studies. 
![gotreescape pipeline](https://github.com/gotreescape/gotreescape/blob/figures/Figures/gotreescape-pipeline.png?raw=true)



This repository consists of the code for two main parts of the system: 1) the GoTreeScape prototype system. 2) The Grammar-based Variational Auto-Encoder machine learning model. 


# GoTreeScape prototype system
The GoTreeScape prototype system achieves users' exploratory design for tree visualizations. The user interface consists of five interactively coordinated views. The main view is the landscape panel (a), which shows the overview of tree visualization design space augmented by a small "bird’s-eye" view providing an orienting overview. A small rectangle within the overview shows the region viewable within the landscape. The visual guidance on the landscape consists of density-based contour and representative landmarks. After users uploading the hierarchical data, GoTreeScape system simplifies the data for the landmarks on landscape and preview panel.  The system further selects partial landmarks to display the corresponding visualization results while mapping other landmarks to circles.To facilitate users making decisions based on one tree visualization, GoTreeScape allows users to click one landmark and show visualization results in the preview panel (b). The right side of the preview panel provides a series of operations for the selected tree visualization, including switching to bottom-up mode based on the visualization, saving the visualization into the gallery, opening the visualization in Tree Illustrator, and check related tree visualizations after fine-tuning the parameters.

Users can flexibly adjust the displayed range of landscape according to their requirements. For the top-down exploration mode, users can decide the range of subsequent explorations interactively according to the landmarks. Additionally, users can zoom into the view and show tree visualizations at a finer granularity and zooming out to change the determined design dimension. Our interface also supports users to filter for the exploratory design on the landscape panel. For example, the view will be updated accordingly according to the provided input query in (e). For the bottom-up mode, we implement a data uploading panel (d), which allows users to upload a tree visualization of GoTree grammar in JSON format. GoTreeScape also provides them with a collection of classic tree visualizations in (c).
![gotreescape user interface](https://github.com/gotreescape/gotreescape/blob/figures/Figures/gotreescape-user-interface1.png?raw=true)


## GoTreeScape System
The front-end and back-end code of the interface is under the system/ folder.

### GoTreeScape FrontEnd
switch to the BackEnd folder
```
cd ./BackEnd
```

run the server
```
python main.py
```

### GoTreeScape BackEnd
switch to the FrontEnd folder
```
cd ./FrontEnd
```

setup the project 
```
npm install
```

Compiles and hot-reloads for development
```
npm run serve
```

Compiles and minifies for production
```
npm run build
```

# Tree visualization GVAE model based on GoTree
This treevis-gvae/ folder contains the GVAE model for tree visualizations based on the code of the original GVAE.
* main.py - the entry for training the GVAE model
* dimensionality reduction results according to different techniques: mds/, tsne/, umap/
* The generated training and testing datasets: trainingdata/




