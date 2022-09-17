<template>
    <div class="within">
        <el-row type="flex" align="middle" justify="space-around">
            <el-col :span="1"></el-col>
            <el-col :span="6" class="panel_para">
                <span>alignment</span>
            </el-col>
            <el-col :span="1"></el-col>
            <!-- <el-col :span="6">
                <div class="panel_control_item" @click="selectAlignment(0)">{{label[axis][0]}}</div>
            </el-col>
            <el-col :span="6">
                <div class="panel_control_item" @click="selectAlignment(1)">{{label[axis][1]}}</div>
            </el-col>
            <el-col :span="6">
                <div class="panel_control_item" @click="selectAlignment(2)">{{label[axis][2]}}</div>
            </el-col> -->
            <el-col :span="15">
                <el-radio-group v-model="selectedPara" @change="selectAlignment()" size="mini">
                  <el-radio-button :label="label[axis][0]"></el-radio-button>
                  <el-radio-button :label="label[axis][1]"></el-radio-button>
                  <el-radio-button :label="label[axis][2]"></el-radio-button>
                </el-radio-group>
                <!-- <div class="panel_control_item" @click="selectAlignment(0)">{{label[axis][0]}}</div> -->
            </el-col>
            <el-col :span="1"></el-col>
        </el-row>
    </div>
</template>

<script>
import {mapState} from 'vuex'

export default {
    name: "within-para",
    props: {
        axisDsl: Object,
        axis: String,
        changeDSL: Function,
        changeCanvas: Function
    },
    data() {
        return {
            label: {
                X: ['left', 'middle', 'right'],
                Y: ['top', 'middle', 'bottom']
            },
            selectedPara: ""
        }
    },
    mounted: function() {
        // console.log('within-para', this.axisDsl)
        if ('Alignment' in this.axisDsl) {
            this.selectedPara = this.axisDsl.Alignment
        } else {
            this.axisDsl.Alignment = "middle"
            this.selectedPara = "middle"
        }
        
    },
    methods: {
        selectAlignment(val) {
            this.axisDsl.Alignment = this.selectedPara
            // console.log(this.axisDsl.Alignment)
            this.changeDSL()
            this.changeCanvas()
        }
    },
    computed: {
        ...mapState([
            'hoverParam',
            'hoverParamAxis'
        ])
    }
}
</script>
<style lang="less">
    .el-radio-button__inner {
        padding: 5px 5px !important;
    }
</style>
<style scoped lang="less">
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
// .within >>> .el-radio-button__inner {
//     padding: 4px 0px;
// }
.panel_control_item {
    background: antiquewhite;
	border: 1px solid rgb(148, 144, 144);
	border-radius: 0.2rem;
    font-size: 0.2rem;
    vertical-align: middle;
    line-height: 1rem;
    height: 1rem;
    width: 80%;
    margin-left: 10%;
}

.hover {
    // margin: 3px 5px;
    // border: 1px solid #ddd;
    border-radius: 5px;
    box-shadow: 0 0 2px rgba(255, 0, 0, 0.5);
    /*transition: ease 0.5s;*/
}
</style>