<template>
    <div id="linkPara">
        <el-row v-if="elementDsl.Link==='arccurve'" type="flex" align="middle" justify="space-around">
            <el-col :span="1"></el-col>
            <el-col :span="6" class="panel_para">
                <span>direction</span>
            </el-col>
            <el-col :span="1"></el-col>
            <el-col :span="15" class="panel_control">
                <el-select v-model="Direction" size="mini" @change="changeDSL_">
                  <el-option
                    v-for="item in DirectionList"
                    :key="item"
                    :label="item"
                    :value="item"/>
                </el-select>
            </el-col>
            <el-col :span="1"></el-col>
        </el-row>
        <el-row type="flex" align="middle" justify="space-around">
            <el-col :span="1"></el-col>
            <el-col :span="6" class="panel_para">
                <span>display</span>
            </el-col>
            <el-col :span="1"></el-col>
            <el-col :span="15" class="panel_control">
                <el-select v-model="LinkDisplay" size="mini" @change="changeDSL_">
                  <el-option
                    v-for="item in LinkDisplayList"
                    :key="item"
                    :label="item"
                    :value="item"/>
                </el-select>
            </el-col>
            <el-col :span="1"></el-col>
        </el-row>
        <el-row type="flex" align="middle" justify="space-around">
            <el-col :span="1"></el-col>
            <el-col :span="6" class="panel_para">
                <span>thickness</span>
            </el-col>
            <el-col :span="1"></el-col>
            <el-col :span="15" class="panel_control">
                <el-select v-model="ThicknessIndex" size="mini" @change="changeDSL_">
                  <el-option
                    v-for="(item, index) in valueList"
                    :key="item.attrName"
                    :label="item.attrName"
                    :value="index"/>
                </el-select>
            </el-col>
            <el-col :span="1"></el-col>
        </el-row>

        <el-row v-if="valueList[ThicknessIndex].attrType === 'default'" type="flex" align="middle" justify="space-around">
            <el-col :span="1"></el-col>
            <el-col :span="6" class="panel_para">
                <span>value</span>
            </el-col>
            <el-col :span="1"></el-col>
            <el-col :span="15" class="panel_control">
                <el-slider
                    @input="changeDSL__"
                    @change="changeCanvas"
                    :max="MaxThickness"
                    v-model="WidthValue"/>
            </el-col>
            <el-col :span="1"></el-col>
        </el-row>

        <el-row v-if="valueList[ThicknessIndex].attrType === 'number'" type="flex" align="middle" justify="space-around">
            <el-col :span="1"></el-col>
            <el-col :span="6" class="panel_para">
                <span>minimum</span>
            </el-col>
            <el-col :span="1"></el-col>
            <el-col :span="15" class="panel_control">
                <el-slider
                    @input="changeDSL__"
                    @change="changeCanvas"
                    :max="MaxThickness"
                    v-model="MinWidthValue"/>
            </el-col>
            <el-col :span="1"></el-col>
        </el-row>

        <el-row v-if="valueList[ThicknessIndex].attrType === 'number'" type="flex" align="middle" justify="space-around">
            <el-col :span="1"></el-col>
            <el-col :span="6" class="panel_para">
                <span>maximum</span>
            </el-col>
            <el-col :span="1"></el-col>
            <el-col :span="15" class="panel_control">
                <el-slider
                    @input="changeDSL__"
                    @change="changeCanvas"
                    :min="MinWidthValue"
                    :max="MaxThickness"
                    v-model="MaxWidthValue"/>
            </el-col>
            <el-col :span="1"></el-col>
        </el-row>
    </div>
</template>

<script>
import {mapState} from 'vuex'
export default {
    name: "link-para",
    props: {
        elementDsl: Object,
        changeDSL: Function,
        changeCanvas: Function
    },
    data() {
        return {
            Thickness: 'static',
            ThicknessIndex: 0,
            WidthValue: 1,
            MinWidthValue: 1,
            MaxWidthValue: 10,
            MaxThickness: 20,
            Direction: 'top',
            DirectionList: ['top', 'bottom'],
            LinkDisplay: 'bottom',
            LinkDisplayList: ['top', 'bottom']
        }
    },
    mounted: function() {
    },
    created: function() {
        if (!('LinkWidth' in this.elementDsl)) {
            this.elementDsl.LinkWidth = this.Thickness
        } else {
            this.LinkWidth = this.elementDsl.LinkWidth
        }
        if (!('LinkDisplay' in this.elementDsl)) {
            this.elementDsl.LinkDisplay = this.LinkDisplay
        } else {
            this.LinkDisplay = this.elementDsl.LinkDisplay
        }
        if (!('StaticThickness' in this.elementDsl)) {
            this.elementDsl.StaticThickness = this.WidthValue
        } else {
            this.WidthValue = Math.floor(this.elementDsl.StaticThickness)
        }
        if (!('MinThickness' in this.elementDsl)) {
            this.elementDsl.MinThickness = this.MinWidthValue
        } else {
            this.MinWidthValue = Math.floor(this.elementDsl.MinThickness)
        }
        if (!('MaxThickness' in this.elementDsl)) {
            this.elementDsl.MaxThickness = this.MaxWidthValue
        } else {
            this.MaxWidthValue = Math.floor(this.elementDsl.MaxThickness)
        }
        if (!('ArcDirection' in this.elementDsl)) {
            this.elementDsl.ArcDirection = this.DirectionList[0]
        } else {
            this.Direction = this.elementDsl.ArcDirection
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
            //  Modify Thickness shown in the drop down box according to the Thickness value passed in by the user
            let Thickness = this.elementDsl.Thickness
            for (let i = 0;i < this.attrObjArray.length;i++) {
                if (Thickness === this.attrObjArray[i].attrName) {
                    this.ThicknessIndex = i
                }
            }
            return tmp
        }
    },
    methods: {
        changeDSL_() {
            this.elementDsl.LinkDisplay = this.LinkDisplay
            console.log('this.valueList', this.valueList)
            this.elementDsl.Thickness = this.valueList[this.ThicknessIndex].attrName
            this.elementDsl.ArcDirection = this.Direction
            this.changeDSL()
            this.changeCanvas()
        },
        changeDSL__() {
            this.elementDsl.StaticThickness = this.WidthValue
            this.elementDsl.MinThickness = this.MinWidthValue
            this.elementDsl.MaxThickness = this.MaxWidthValue
            this.changeDSL()
        }
    }
}
</script>

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
.el-row {
    margin-bottom: 5px;
}
/* .panel_control {
    height: 2rem;
	background: antiquewhite;
	border: 1px solid rgb(148, 144, 144);
	border-radius: 0.2rem;
} */

</style>