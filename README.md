# GoTreeScape: Navigate and Explore the Tree Visualization Design Space
Declarative grammar has becoming an increasingly significant technique for understanding visualization design space. We propose GoTreeScape system to facilitate the navigation and exploration of the vast design space implied by GoTree, a declarative grammar of tree visualizations. To provide users with the design space overview, GoTreeScape utilizes an Encoder-Decoder architecture to project tree visualizations into a 2D landscape, taking into account the  relationships between different design features. Furthermore, GoTreeScape includes an exploratory framework, enabling top-down, bottom-up, and hybrid modes to support the inherently undirected nature of exploratory search. We demonstrate that GoTreeScape can expand the diversity of user-designed tree visualizations through two case studies. 
![gotreescape pipeline](https://github.com/gotreescape/gotreescape/blob/figures/Figures/gotreescape-pipeline.png?raw=true)

This repository consists of the code for two main parts of the system: 1) the GoTreeScape prototype system. 2) The Grammar-based Variational Auto-Encoder machine learning model. 


# GoTreeScape prototype system
The GoTreeScape prototype system achieves users' exploratory design for tree visualizations. The user interface consists of five interactively coordinated views. The main view is the landscape panel (a), which shows the overview of tree visualization design space augmented by a small "bird’s-eye" view providing an orienting overview. A small rectangle within the overview shows the region viewable within the landscape. The visual guidance on the landscape consists of density-based contour and representative landmarks. After users uploading the hierarchical data, GoTreeScape system simplifies the data for the landmarks on landscape and preview panel.  The system further selects partial landmarks to display the corresponding visualization results while mapping other landmarks to circles.To facilitate users making decisions based on one tree visualization, GoTreeScape allows users to click one landmark and show visualization results in the preview panel (b). The right side of the preview panel provides a series of operations for the selected tree visualization, including switching to bottom-up mode based on the visualization, saving the visualization into the gallery, opening the visualization in Tree Illustrator, and check related tree visualizations after fine-tuning the parameters.

Users can flexibly adjust the displayed range of landscape according to their requirements. For the top-down exploration mode, users can decide the range of subsequent explorations interactively according to the landmarks. Additionally, users can zoom into the view and show tree visualizations at a finer granularity and zooming out to change the determined design dimension. Our interface also supports users to filter for the exploratory design on the landscape panel. For example, the view will be updated accordingly according to the provided input query in (e). For the bottom-up mode, we implement a data uploading panel (d), which allows users to upload a tree visualization of GoTree grammar in JSON format. GoTreeScape also provides them with a collection of classic tree visualizations in (c).
![gotreescape user interface](https://github.com/gotreescape/gotreescape/blob/figures/Figures/gotreescape-user-interface1.png?raw=true)


# Code structure introduction
This projection consists of two parts. The first part is about the model training based on the tree visualization declarative grammar and the GVAE training model (/treevis-gvae); The second part is about the the GoTreeScape interactive system (/interactive-system). \\

## Model training part (/treevis-gvae):
* main.py: the entry of model training part 
* model_vae_weight.py: defines the weighted VAE model which refines the loss function with the weights of design features
* train_weight.py: train the weighted vae model defined in the model_vae_weight.py
* vis_grammar.py: define the CFG grammar for tree visualizations based on GoTree Grammar
* simplify_cluster_tree.py: simplify the hierarchical clustering results according to the setted threshold
* compute_umap_embeddings.py: compute the embedding results based on UMAP dimensionality reduction technique for the latent vectors
* compute_tsne_sklearn.py: compute the embedding results based on t-SNE dimensionality reduction techniques for the latent vectors
* process_csv.py: read and save the csv file 
* process_json.py: read and save the json file 
* sourcedata/training.txt: the data about the  tree visualization declarative grammar
* simplified_hierarchical_cluster/: save the simplified hierarchical clustering results
* shell_files/: the shell file for training weighted vae mode, computing the latent vectors, simplifying the clustering results, computing the UMAP dimensionality reduction results, computing the t-SNE dimensionality reduction results. 
* projection_results: save the projection results
* hierarchical_clustering_results: save the hierarchical clustering results
* embeddings: save the embedding results

## GoTreeScape prototype interactive system (/interactive-system):
The GoTreeScape prototype system is based on the client-server architecture, it consists of two parts: the BackEnd and the FrontEnd.

### FrontEnd
* main.js: the entry of the FrontEnd part
* App.vue: the entry of the FrontEnd view, consisting of the Tree Illustrator panel (views/MainTap/TreeIllustratorTap.vue) based on the GoTree declarative grammar and GoTreeScape panel (views/MainTap/GoTreeScapeTap.vue) which show the landscape of GoTree grammar. 
* views/TreeVisMapView/: rendering the lanscape view in the GoTreeScape prototype system.
* views/TreeVisThumbnail/: show the representative tree visualization on the GoTreeScape prototype system.
* views/TreeCanvasView/, views/TreeUnitParameterView/, views/TreeModuleView/, views/ParameterView/, views/DslList/, views/Components/: the tree visualization canvas, tree unit parameters, tree visualization module, parameter model, and declarative grammar list, and the different components within the TreeUnit view. These parts are based on the GoTree declarative grammar and the Tree Illustrator prototype system. 
* treevis-style/: compute the tree visualization parameters based on the declarative grammar. 
* treevis-node-glyph/: compute the node visual elements in tree visualizations, in particular, all nodes in tree visualizations are represented by the \<path\> for the smooth transition between different tree visualizations. 


### BackEnd
The BackEnd





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




