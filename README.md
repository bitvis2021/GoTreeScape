# GoTreeScape: Navigate and Explore the Tree Visualization Design Space
Declarative grammar has becoming an increasingly significant technique for understanding visualization design space. We propose GoTreeScape system to facilitate the navigation and exploration of the vast design space implied by GoTree, a declarative grammar of tree visualizations. To provide users with the design space overview, GoTreeScape utilizes an Encoder-Decoder architecture to project tree visualizations into a 2D landscape, taking into account the  relationships between different design features. Furthermore, GoTreeScape includes an exploratory framework, enabling top-down, bottom-up, and hybrid modes to support the inherently undirected nature of exploratory search. We demonstrate that GoTreeScape can expand the diversity of user-designed tree visualizations through two case studies. 
![gotreescape pipeline](https://github.com/gotreescape/gotreescape/blob/figures/Figures/gotreescape-pipeline.png?raw=true)

This repository consists of the code for two main parts of the system: 1) the GoTreeScape prototype system. 2) The Grammar-based Variational Auto-Encoder machine learning model. 


# GoTreeScape prototype system
The GoTreeScape prototype system achieves users' exploratory design for tree visualizations. The user interface consists of five interactively coordinated views. The main view is the landscape panel (a), which shows the overview of tree visualization design space augmented by a small "bird’s-eye" view providing an orienting overview. A small rectangle within the overview shows the region viewable within the landscape. The visual guidance on the landscape consists of density-based contour and representative landmarks. After users uploading the hierarchical data, GoTreeScape system simplifies the data for the landmarks on landscape and preview panel.  The system further selects partial landmarks to display the corresponding visualization results while mapping other landmarks to circles.To facilitate users making decisions based on one tree visualization, GoTreeScape allows users to click one landmark and show visualization results in the preview panel (b). The right side of the preview panel provides a series of operations for the selected tree visualization, including switching to bottom-up mode based on the visualization, saving the visualization into the gallery, opening the visualization in Tree Illustrator, and check related tree visualizations after fine-tuning the parameters.

Users can flexibly adjust the displayed range of landscape according to their requirements. For the top-down exploration mode, users can decide the range of subsequent explorations interactively according to the landmarks. Additionally, users can zoom into the view and show tree visualizations at a finer granularity and zooming out to change the determined design dimension. Our interface also supports users to filter for the exploratory design on the landscape panel. For example, the view will be updated accordingly according to the provided input query in (e). For the bottom-up mode, we implement a data uploading panel (d), which allows users to upload a tree visualization of GoTree grammar in JSON format. GoTreeScape also provides them with a collection of classic tree visualizations in (c).
![gotreescape user interface](https://github.com/gotreescape/gotreescape/blob/figures/Figures/gotreescape-user-interface1.png?raw=true)


# Code structure introduction
This projection consists of two parts. The first part is about the model training based on the tree visualization declarative grammar and the GVAE training model (/treevis-gvae); The second part is about the the GoTreeScape interactive system (/interactive-system). 

## Model training part (/treevis-gvae):
* **main.py**: the entry of model training part 
* **model_vae_weight.py**: the weighted VAE model which refines the loss function with the weights of design features
* **train_weight.py**: the code for training the weighted vae model defined in model_vae_weight.py
* **vis_grammar.py**: the CFG grammar for tree visualizations based on GoTree Grammar
* **simplify_cluster_tree.py**: the simplification for the hierarchical clustering results according to the specific threshold
* **compute_umap_embeddings.py**: computing the embedding results based on UMAP dimensionality reduction technique for the latent vectors
* **compute_tsne_sklearn.py**: computing the embedding results based on t-SNE dimensionality reduction techniques for the latent vectors
* **process_csv.py**: the processing function (reading and saving) for the csv file 
* **process_json.py**: the processing function (reading and saving) for the json file 
* **sourcedata/training.txt**: the data about the tree visualization declarative grammar
* **simplified_hierarchical_cluster/**: the hierarchical clustering results after simplification
* **shell_files/**: the shell file for training weighted vae mode, computing the latent vectors, simplifying the clustering results, computing the UMAP dimensionality reduction results, computing the t-SNE dimensionality reduction results. 
* **projection_results/**: the projection results
* **hierarchical_clustering_results/**: the hierarchical clustering results
* **embeddings/**: the embedding results

## GoTreeScape prototype interactive system (/interactive-system):
The GoTreeScape prototype system is based on the client-server architecture, it consists of two parts: the BackEnd and the FrontEnd.

### FrontEnd
The FrontEnd of GoTreeScape prototype system is based on the [vue framework](https://vuejs.org/). 


* **main.js**: the entry of the FrontEnd part
* **App.vue**: the entry of the FrontEnd view, which consists of the Tree Illustrator panel (views/MainTap/TreeIllustratorTap.vue) based on the GoTree declarative grammar and GoTreeScape panel (views/MainTap/GoTreeScapeTap.vue) which show the landscape of GoTree grammar. 
* **views/TreeVisMapView/**: rendering the landscape view in the GoTreeScape prototype system.
* **views/TreeVisThumbnail/**: the representative tree visualizations on the GoTreeScape prototype system.
* **views/TreeCanvasView/**, **views/TreeUnitParameterView/**, **views/TreeModuleView/**, **views/ParameterView/**, **views/DslList/**, **views/Components/**: the tree visualization canvas, tree unit parameters, tree visualization module, parameter model, and declarative grammar list, and the different components within the TreeUnit view. These parts are based on the GoTree declarative grammar and the Tree Illustrator prototype system. 
* **treevis-style/**: computing the tree visualization parameters based on the declarative grammar. 
* **treevis-node-glyph/**: computing the node visual elements in tree visualizations, in particular, all nodes in tree visualizations are represented by the \<path\> for the smooth transition between different tree visualizations. 
* **sampling/**: sampling the hierarchical data based on the computing the strahler number.
* **dsl/, components/, computation/**: computing the layout based on the tree visualization declarative grammar and hierarchical data. These parts are based on the GoTree declarative grammar and Tree Illustrator prototype system.
* **link/, element/, coordinatesystem/**: transforming the computed layouts to the visual parameters of tree visualizations. These parts are based on the GoTree declarative grammar and Tree Illustrator prototype system.
* **communication/**: sending the parameters to the **BackEnd**, including the zooming level, filtering criteria specified by users in the GoTreeScape prototype system.

### BackEnd

The BackEnd of GoTreeScape prototype system is based on the [Flask framework](https://flask.palletsprojects.com/en/2.2.x/).

* **main.js**: the entry of the BackEnd part. It defines the handler of querying declarative grammar, filtering the dsl collection, querying the representative landmarks on the landscape, computing the position by uploading the declarative grammar.
* **process_csv.py**: the processing function (reading and saving) for the csv file 
* **process_json.py**: the processing function (reading and saving) for the json file 
* **load_data.py**: loading the txt file
* **cluster_computation.py**: compute the representative tree visualizations according to the zooming level specified by the FrontEnd.
* **dsl_collection.py**: loading the dsl collection and filtering the tree visualization collection by some specific design features.
* **compute_cluster_center.py**: computing the central positions of different clusters, which is used for the computing explicit boundaries between different clusters.


## How to run the GoTreeScape prototype system?
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




