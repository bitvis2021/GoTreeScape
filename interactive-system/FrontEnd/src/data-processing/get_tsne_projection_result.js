import TSNE from 'tsne-js';

export function getTSNEProjectionResult (treeDistanceMatrix) {
	//	Calculate the result of TSNE
	let model = new TSNE({
	  dim: 2,
	  perplexity: 30.0,
	  earlyExaggeration: 4.0,
	  learningRate: 100.0,
	  nIter: 1000,
	  metric: 'euclidean'
	});
	model.init({
	  data: treeDistanceMatrix,
	  type: 'dense'
	});
	let [error, iter] = model.run();
	let output = model.getOutput();
	let outputScaled = model.getOutputScaled();
	return outputScaled
}