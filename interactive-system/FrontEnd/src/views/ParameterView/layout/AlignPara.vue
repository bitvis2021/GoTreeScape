<template>
    <div>
        <el-row type="flex" align="middle" justify="space-around" class="outer-row">
            <el-col :span="1"></el-col>
            <el-col :span="6" class="panel_para">
                <span>alignment</span>
            </el-col>
            <el-col :span="1"></el-col>
            <el-col :span="15">
                <el-radio-group v-model="selectedPara" @change="selectAlignment()" size="mini">
                  <el-radio-button :label="label[axis][0]"></el-radio-button>
                  <el-radio-button :label="label[axis][1]"></el-radio-button>
                  <el-radio-button :label="label[axis][2]"></el-radio-button>
                </el-radio-group>
                <!-- <div class="panel_control_item" @click="selectAlignment(0)">{{label[axis][0]}}</div> -->
            </el-col>
            <el-col :span="1"></el-col>
<!--             <el-col :span="6">
                <div class="panel_control_item" @click="selectAlignment(1)">{{label[axis][1]}}</div>
            </el-col>
            <el-col :span="6">
                <div class="panel_control_item" @click="selectAlignment(2)">{{label[axis][2]}}</div>
            </el-col> -->
        </el-row>
    </div>
</template>

<script>
import {mapState} from 'vuex'
export default {
    name: "align-para",
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
            selectedPara: '',
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
    // watch: {
    //     axisDsl(val) {
    //         console.log('within-para', val)
    //     }
    // },
    methods: {
        selectAlignment() {
            this.axisDsl.Alignment = this.selectedPara
            this.changeDSL()
            this.changeCanvas()
            // console.log(this.axisDsl.Alignment)
        }
    },
    computed: {
        ...mapState([
            'manipulatePara',
            'manipulateValue',
            'hoverParam',
            'hoverParamAxis'
        ])
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
/* .outer-row {
    margin-bottom: 5px;
} */
/* .panel_control {
	background: antiquewhite;
	border: 1px solid rgb(148, 144, 144);
	border-radius: 0.2rem;
} */
.panel_control_item {
    /*background: antiquewhite;*/
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
    /*margin: 2px 3px;*/
    /*border: 1px solid #ddd;*/
    border-radius: 5px;
    box-shadow: 0 0 2px rgba(255, 0, 0, 0.5);
    /*transition: ease 0.5s;*/
}
</style>