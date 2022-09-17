import { addDslDefaultSetting } from '@/dsl-processing/add_dsl_default_setting.js'

export default function (treeDsls) {
    for (let id in treeDsls) {
        let treeDsl_ = treeDsls[id]
        let treeDsl = JSON.parse(JSON.stringify(treeDsl_))
        if (!('Element' in treeDsl)) {
            treeDsl.Element = {}
        }
        if (!('RootWidth' in treeDsl.Element)) {
            treeDsl.Element.RootWidth = 'adaptive'
        }
        if (!('RootHeight' in treeDsl.Element)) {
            treeDsl.Element.RootHeight = 'adaptive'
        }
        if (!('SubtreeWidth' in treeDsl.Layout)) {
            treeDsl.Layout.SubtreeWidth = 'adaptive'
        }
        if (!('SubtreeHeight' in treeDsl.Layout)) {
            treeDsl.Layout.SubtreeHeight = 'adaptive'
        }
        // Added default parameter Settings for layout
        if (!('X' in treeDsl.Layout)) {
            treeDsl.Layout.X = {}
            treeDsl.Layout.Y = {}
        }
        if (!('Subtree' in treeDsl.Layout.X)) {
            treeDsl.Layout.X.Subtree = {
                Relation: 'align',
            }
            treeDsl.Layout.Y.Subtree = {
                Relation: 'align'
            }
        } else {
            let subtree = treeDsl.Layout.X.Subtree
            if ((!('Relation' in subtree)) || (subtree.Relation === 'Undefined')) {
                subtree.Relation = 'align'
            }
            if ('Margin_' in subtree) {
                if (!isNaN(subtree.Margin)) {
                    subtree.Margin += subtree.Margin_
                }
            }
            subtree = treeDsl.Layout.Y.Subtree
            if ((!('Relation' in subtree)) || (subtree.Relation === 'Undefined')) {
                subtree.Relation = 'align'
            }
            if ('Margin_' in subtree) {
                if (!isNaN(subtree.Margin)) {
                    subtree.Margin += subtree.Margin_
                }
            }
        }
        if (!('Root' in treeDsl.Layout.X)) {
            treeDsl.Layout.X.Root = {
                Relation: 'include'
            }
            treeDsl.Layout.Y.Root = {
                Relation: 'include'
            }
        } else {
            let root = treeDsl.Layout.X.Root
            if ((!('Relation' in root)) || (root.Relation === 'Undefined')) {
                root.Relation = 'include'
            }            
            if ('Padding_' in root) {
                if (!isNaN(root.Padding[0])) {
                    root.Padding[0] += root.Padding_[0]
                }
                if (!isNaN(root.Padding[1])) {
                    root.Padding[1] += root.Padding_[1]
                }
                // root.Padding[0] += root.Padding_[0]
                // root.Padding[1] += root.Padding_[1]
            }
            if ('Margin_' in root) {
                if (!isNaN(root.Margin)) {
                    root.Margin += root.Margin_
                }
                // root.Margin += root.Margin_
            }
            root = treeDsl.Layout.Y.Root
            if ((!('Relation' in root)) || (root.Relation === 'Undefined')) {
                root.Relation = 'include'
            }
            if ('Padding_' in root) {
                if (!isNaN(root.Padding[0])) {
                    root.Padding[0] += root.Padding_[0]
                }
                if (!isNaN(root.Padding[1])) {
                    root.Padding[1] += root.Padding_[1]
                }
                // root.Padding[0] += root.Padding_[0]
                // root.Padding[1] += root.Padding_[1]
            }
            if ('Margin_' in root) {
                if (!isNaN(root.Margin)) {
                    root.Margin += root.Margin_
                }
                // root.Margin += root.Margin_
            }
        }
        if (!('MarginType' in treeDsl.Layout.X.Subtree)) {
            treeDsl.Layout.X.Subtree.MarginType = 'space-around'
        }
        if (!('MarginType' in treeDsl.Layout.Y.Subtree)) {
            treeDsl.Layout.Y.Subtree.MarginType = 'space-around'
        }
        treeDsls[id] = treeDsl
    }
}
