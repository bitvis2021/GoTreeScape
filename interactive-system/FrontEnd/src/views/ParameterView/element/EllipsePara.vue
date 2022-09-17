<template>
    <div id="ellipsePara">        
        <el-row type="flex" align="middle" justify="space-around">
            <el-col :span="1"></el-col>
            <el-col :span="6" class="panel_para">
                <span>width</span>
            </el-col>
            <el-col :span="1"></el-col>
            <el-col :span="15" class="panel_control">
                <el-select v-model="RootWidth" size="mini" @change="changeDSL_">
                  <el-option
                    v-for="item in widthValueList"
                    :key="item.attrName"
                    :label="item.attrName"
                    :value="item.attrName"/>
                </el-select>
            </el-col>
            <el-col :span="1"></el-col>
        </el-row>
        <el-row type="flex" align="middle" justify="space-around">
            <el-col :span="1"></el-col>
            <el-col :span="6" class="panel_para">
                <span>height</span>
            </el-col>
            <el-col :span="1"></el-col>
            <el-col :span="15" class="panel_control">
                <el-select v-model="RootHeight" size="mini" @change="changeDSL_">
                  <el-option
                    v-for="item in widthValueList"
                    :key="item.attrName"
                    :label="item.attrName"
                    :value="item.attrName"/>
                </el-select>
            </el-col>
            <el-col :span="1"></el-col>
        </el-row>
        <el-row type="flex" align="middle" justify="space-around">
            <el-col :span="1"></el-col>
            <el-col :span="6" class="panel_para">
                <span>label</span>
            </el-col>
            <el-col :span="1"></el-col>
            <el-col :span="15" class="panel_control">
                <el-select v-model="Label" size="mini" @change="changeDSL_">
                  <el-option
                    v-for="item in labelValueList"
                    :key="item.attrName"
                    :label="item.attrName"
                    :value="item.attrName"/>
                </el-select>
            </el-col>
            <el-col :span="1"></el-col>
        </el-row>
        <el-row v-if="Label!=='hidden'" type="flex" align="middle" justify="space-around">
            <el-col :span="1"></el-col>
            <el-col :span="6" class="panel_para">
                <span>anchor</span>
            </el-col>
            <el-col :span="1"></el-col>
            <el-col :span="15" class="panel_control">
                <el-select v-model="TextAnchor" size="mini" @change="changeDSL_">
                  <el-option
                    v-for="item in TextAnchorList"
                    :key="item"
                    :label="item"
                    :value="item"/>
                </el-select>
            </el-col>
            <el-col :span="1"></el-col>
        </el-row>

        <el-row v-if="Label!=='hidden'" type="flex" align="middle" justify="space-around">
            <el-col :span="1"></el-col>
            <el-col :span="6" class="panel_para">
                <span>dx</span>
            </el-col>
            <el-col :span="1"></el-col>
            <el-col :span="15" class="panel_control">
                <el-slider
                    @input="changeDSL__"
                    @change="changeCanvas"
                    :min="-100"
                    v-model="TextDx"/>
            </el-col>
            <el-col :span="1"></el-col>
        </el-row>

        <el-row v-if="Label!=='hidden'" type="flex" align="middle" justify="space-around">
            <el-col :span="1"></el-col>
            <el-col :span="6" class="panel_para">
                <span>dy</span>
            </el-col>
            <el-col :span="1"></el-col>
            <el-col :span="15" class="panel_control">
                <el-slider
                    @input="changeDSL__"
                    @change="changeCanvas"
                    :min="-100"
                    v-model="TextDy"/>
            </el-col>
            <el-col :span="1"></el-col>
        </el-row>

        <!-- <el-row v-if="Label!=='hidden'" type="flex" align="middle" justify="space-around">
            <el-col :span="1"></el-col>
            <el-col :span="6" class="panel_para">
                <span>rotation</span>
            </el-col>
            <el-col :span="1"></el-col>
            <el-col :span="15" class="panel_control">
                <el-slider
                    @input="changeDSL__"
                    @change="changeCanvas"
                    :min="-100"
                    v-model="TextRotation"/>
            </el-col>
            <el-col :span="1"></el-col>
        </el-row> -->
        <el-row type="flex" align="middle" justify="space-around">
            <el-col :span="1"></el-col>
            <el-col :span="6" class="panel_para">
                <span>color</span>
            </el-col>
            <el-col :span="1"></el-col>
            <el-col :span="15" class="panel_control">
                <el-select v-model="colorIndex" size="mini" @change="changeColor">
                  <el-option
                    v-for="(item, index) in valueList"
                    :key="item.attrName"
                    :label="item.attrName"
                    :value="index"/>
                </el-select>
            </el-col>
            <el-col :span="1"></el-col>
        </el-row>
        <el-row v-if="colorFlag==='default'" type="flex" align="middle" justify="space-around">
            <el-col :span="1"></el-col>
            <el-col :span="6" class="panel_para">
                <span>value</span>
            </el-col>
            <el-col :span="1"></el-col>
            <el-col :span="15" class="panel_control">
                <el-color-picker 
                    @change="changeDSL_"
                    size="mini"
                    v-model="StaticColor"/>
            </el-col>
            <el-col :span="1"></el-col>
        </el-row>
        <el-row v-if="colorFlag==='number'" type="flex" align="middle" justify="space-around">
            <el-col :span="1"></el-col>
            <el-col :span="6" class="panel_para">
                <span>colorRange</span>
            </el-col>
            <el-col :span="2"></el-col>
            <el-col :span="4" class="panel_control">
                <el-color-picker 
                    @change="changeDSL_"
                    size="mini"
                    v-model="ColorRange[0]"/>
            </el-col>
            <el-col :span="1"></el-col>
            <el-col :span="4" class="panel_control">
                <el-color-picker
                    @change="changeDSL_" 
                    size="mini"
                    v-model="ColorRange[1]"/>
            </el-col>
            <el-col :span="4"></el-col>
        </el-row>
        <!-- <el-row v-if="colorFlag==='number'" type="flex" align="middle" justify="space-around">
            <el-col :span="1"></el-col>
            <el-col :span="6" class="panel_para">
                <span>color-max</span>
            </el-col>
            <el-col :span="1"></el-col>
            <el-col :span="10" class="panel_control">
                <el-color-picker 
                    size="mini"
                    v-model="elementDsl.ColorRange[1]"/>
            </el-col>
            <el-col :span="4"></el-col>
        </el-row> -->
        <el-row v-if="colorFlag==='string'" type="flex" align="middle" justify="space-around">
            <el-col :span="1"></el-col>
            <el-col :span="6" class="panel_para">
                <span>colorSchema</span>
            </el-col>
            <el-col :span="1"></el-col>
            <el-col :span="15" class="panel_control">
                <el-select v-model="ColorSchema" size="mini" @change="changeDSL_">
                  <el-option
                    v-for="schema in colorSchemaList"
                    :key="schema"
                    :label="schema"
                    :value="schema"/>
                </el-select>
            </el-col>
            <el-col :span="1"></el-col>
        </el-row>
    </div>
</template>

<script>
import {mapState} from 'vuex'
export default {
    name: "ellipse-para",
    props: {
        elementDsl: Object,
        changeDSL: Function,
        changeCanvas: Function
    },
    data() {
        return {
            colorFlag: 'default',
            colorIndex: 0,
            colorSchemaList: [
                'option 1',
                'option 2'
            ],
            RootWidth: 'adaptive',
            RootHeight: 'adaptive',
            sizeOption: 'fill',
            ColorRange: ['', ''],
            ColorSchema: '',
            StaticColor: '#6baed6',
            Label: 'hidden',
            TextAnchor: 'middle',
            TextAnchorList: [
                'start',
                'middle',
                'end'
            ],
            TextDx: 0,
            TextDy: 0,
            TextRotation: 0
        }
    },
    mounted: function() {
        // console.log('ellipse-para', this.elementDsl)
    },
    created: function () {
        console.log('this.valueList', this.valueList)
        this.colorFlag = this.valueList[this.colorIndex].attrType
        if ('TextRotation' in this.elementDsl) {
            this.TextRotation = Math.floor(this.elementDsl.TextRotation * 100)
        } else {
            this.elementDsl.TextRotation = this.TextRotation / 100.0
        }
        if ('TextDx' in this.elementDsl) {
            this.TextDx = Math.floor(this.elementDsl.TextDx * 100)
        } else {
            this.elementDsl.TextDx = this.TextDx / 100.0
        }
        if ('TextDy' in this.elementDsl) {
            this.TextDy = Math.floor(this.elementDsl.TextDy * 100)
        } else {
            this.elementDsl.TextDy = this.TextDy / 100.0
        }
        if ('TextAnchor' in this.elementDsl) {
            this.TextAnchor = this.elementDsl.TextAnchor
        } else {
            this.elementDsl.TextAnchor = this.TextAnchor
        }
        if (!('ColorRange' in this.elementDsl)) {
            this.elementDsl.ColorRange = ['#2171b5', '#deebf7']
            this.ColorRange = ['#2171b5', '#deebf7']
        } else {
            this.ColorRange[0] = this.elementDsl.ColorRange[0]
            this.ColorRange[1] = this.elementDsl.ColorRange[1]
        }
        if (!('RootWidth' in this.elementDsl)) {
            this.elementDsl.RootWidth = 'adaptive'
        } else {
            this.RootWidth = this.elementDsl.RootWidth
        }
        if (!('RootHeight' in this.elementDsl)) {
            this.elementDsl.RootHeight = 'adaptive'
        } else {
            this.RootHeight = this.elementDsl.RootHeight
        }
        if (!('ColorSchema' in this.elementDsl)) {
            this.elementDsl.ColorSchema = this.colorSchemaList[0]
            this.ColorSchema = this.colorSchemaList[0]
        } else {
            this.ColorSchema = this.elementDsl.ColorSchema
        }
        if ('Color' in this.elementDsl) {
            this.valueList.forEach((attr, index) => {
                if (attr.attrName === this.elementDsl.Color) {
                    this.colorIndex = index
                    this.colorFlag = attr.attrType
                }
            })
        } else {
            this.elementDsl.Color = this.valueList[this.colorIndex].attrName
            this.elementDsl.ColorType = this.valueList[this.colorIndex].attrType
        }
        if ('StaticColor' in this.elementDsl) {
            this.StaticColor = this.elementDsl.StaticColor
        } else {
            this.elementDsl.StaticColor = this.StaticColor
        }
        if ('Label' in this.elementDsl) {
            this.Label = this.elementDsl.Label
        } else {
            this.elementDsl.Label = this.Label
        }
    },
    computed: {
        ...mapState([
            'attrObjArray'
        ]),
        valueList: function() {
            let tmp = [{
                attrName: 'static',
			    attrType: 'default'
            }]
            this.attrObjArray.forEach((attr) => {
                if (attr.attrType === 'number') {
                    tmp.push({...attr})
                }
            })
            return tmp
        },
        widthValueList: function() {
            let tmp = [{
                attrName: 'adaptive',
			    attrType: 'default'
            }]
            this.attrObjArray.forEach((attr) => {
                tmp.push({...attr})
            })
            return tmp
        },
        labelValueList: function() {
            let tmp = [{
                attrName: 'hidden',
			    attrType: 'default'
            }]
            this.attrObjArray.forEach((attr) => {
                tmp.push({...attr})
            })
            return tmp
        }
    },
    methods: {
        changeColor(colorIndex) {
            let attr = this.valueList[colorIndex]
            this.colorFlag = attr.attrType
            this.elementDsl.Color = attr.attrName
            this.elementDsl.ColorType = attr.attrType
            this.changeDSL()
            this.changeCanvas()
        },
        changeDSL_() {
            this.elementDsl.RootWidth = this.RootWidth
            this.elementDsl.RootHeight = this.RootHeight
            this.elementDsl.ColorRange[0] = this.ColorRange[0]
            this.elementDsl.ColorRange[1] = this.ColorRange[1]
            this.elementDsl.ColorSchema = this.ColorSchema
            this.elementDsl.StaticColor = this.StaticColor
            this.elementDsl.Label = this.Label
            this.elementDsl.TextAnchor = this.TextAnchor
            this.changeDSL()
            this.changeCanvas()
        },
        changeDSL__() {
            this.elementDsl.TextDx = this.TextDx / 100.0
            this.elementDsl.TextDy = this.TextDy / 100.0
            this.elementDsl.TextRotation = this.TextRotation / 100.0
            this.changeDSL()
        }
    }
}
</script>
<style lang="less">
    #ellipsePara {
        .el-row {
            margin-bottom: 5px;
        }
    }
</style>
<style scoped>
.panel_para {
	/* background: antiquewhite;
	border: 1px solid rgb(148, 144, 144);
	border-radius: 0.2rem; */
    font-size: 0.2rem;
    vertical-align: middle;
    line-height: 1rem;
    height: 1rem;
}

/* .panel_control {
    height: 2rem;
	background: antiquewhite;
	border: 1px solid rgb(148, 144, 144);
	border-radius: 0.2rem;
} */

</style>


