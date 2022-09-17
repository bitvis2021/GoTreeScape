export default function solveMatrix(A_, B_, m) {
    // initialize
	let l = A_.length // l is the number of constraints
	let n = A_[0].length // n indicates the dimension of constraint
	let A = new m.Matrix()
	A.init(l, n)
	let Adata = A.data()
	A_.forEach((constraint, i) => {
		constraint.forEach((value, j) => {
			Adata[i + j * l] = value
		})
	})

	let B = new m.Matrix()
	B.init(l, 1)
	let Bdata = B.data()
	B_.forEach((value, i) => {
		Bdata[i] = value
	})

	// use lscg-solver
	let ker = new m.Matrix()
	let X = new m.Matrix()
	m.Matrix.SolveLinearSystem(X, ker, A, B)
	let Xdata = X.data()

	// get the result
	let result = []
	for (let i = 0; i < Xdata.length; i++) {
		result.push(Xdata[i])
	}

	// destroy part, release memory
	A.destroy()
	B.destroy()
	X.destroy()
	ker.destroy()

	return result
}