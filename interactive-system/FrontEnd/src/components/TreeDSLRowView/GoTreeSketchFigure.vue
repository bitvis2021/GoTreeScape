<template>
	<div class = "dsl-teaser-container">
		{{dslId}}
	</div>
</template>

<script>
  import GoTreeSketchFigure from './GoTreeSketchFigure.vue';
  import { Drag, Drop } from 'vue-drag-drop';
  import { mapMutations } from 'vuex';

  export default {
	name: 'GoTreeSketchFigure',
	components: {
		GoTreeSketchFigure, Drag, Drop
	},
	props: [
		dslId: {
			type: String
		}
	],
	data() {
	  return {
	  }	
	},
	created: function () {
	},
	beforeMount: function() {
	},
	mounted: function() {
		console.log('dslId', this.dslId)
	},
	computed: {
	},
	methods: {
 	}
  }
</script>

<style lang="less">
	.dsl-teaser-container {
		font-family: 'Avenir', Helvetica, Arial, sans-serif;
		width: 100%;
		height: 100%;
	}
</style>
