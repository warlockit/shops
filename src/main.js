import Vue from 'vue'
import VueResource from 'vue-resource'
import YmapPlugin from 'vue-yandex-maps/src/index.js'

require('../node_modules/simplebar/dist/simplebar.css')
require('./assets/map.scss')
import Map from './map.vue';

Vue.use(VueResource)
Vue.use(YmapPlugin)

require('../node_modules/simplebar/dist/simplebar.js')

Vue.component('mapwidget', Map);

window.shopsMap = new Vue({
  el: '#shops-box',
  data: {
    searchString: "",
    activeCity: "Москва"
  }
})
