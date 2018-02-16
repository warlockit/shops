<template lang="html">
	<div class="map-widget">
		<div class="map-tabs">
			<div class="row">
				<div class="col-md-6">
					<div class="map-filters" v-if="false">
						<input type="checkbox" value="pickpoint" v-model="mapFilter">
						<label for="pickpoint">постаматы Pickpoint</label>
						<input type="checkbox" value="firm" v-model="mapFilter">
						<label for="firm">фирменные магазины</label>
					</div>
				</div>
				<div class="col-md-6 col-sm-6 col-xs-12">
					<ul class="shops-links clearfix">
						<li class="shops-link">
							<a href="#map" v-bind:class="{'active': layout == 'map'}" v-on:click="layout = 'map'">
								<span>
									<i class="map-icon icon-placemark"></i>
									Карта
								</span>
							</a>
						</li>
						<li class="shops-link" v-if="false">
							<a href="#metro" v-bind:class="{'active': layout == 'metro'}" v-on:click="layout = 'metro'">
								<span>
									<i class="map-icon icon-metro"></i>
									Схема метро
								</span>
							</a>
						</li>
						<li class="shops-link">
							<a href="#list" v-bind:class="{'active': layout == 'list'}" v-on:click="layout = 'list'">
								<span>
									<i class="map-icon icon-list"></i>
									Список
								</span>
							</a>
						</li>
					</ul>
					<a href="#" class="show-search" v-on:click.prevent="showSearch = !showSearch">
						<i class="icon-search map-icon"></i>
					</a>
				</div>
				<transition name="fade">
					<div class="col-sm-6 col-xs-12 tablet" v-if="showSearch">
						<div class="search-box">
							<input class="mobile-search-string" type="text" v-model="searchString" placeholder="Адрес, метро или ТЦ" />
							<i class="icon-search map-icon"></i>
						</div>
					</div>
  			</transition>
			</div>
		</div>
		<template v-if="this.notFound">
			<div class="notfound-message">
				К сожалению в вашем городе нет фирменных магазинов Даджета и постаматов Pickpoint. Вы можете заказать товар с доставкой Почтой России.
			</div>
		</template>
		<template v-if="this.shops[this.activeCity] == undefined && this.postamats[this.activeCity] != undefined">
			<div class="pickpoint-message">
				Пока нашего магазина нет в вашем городе. Товар можно заказать с доставкой и забрать в удобном постамате Pickpoint.
			</div>
		</template>
		<template v-if="filteredShops.length == 0 && searchString != ''">
			<div class="message">
				По вашему запросу ничего не найдено.
			</div>
		</template>
		<template v-if="filteredShops.length > 0">
			<div class="row" id="shops-list" v-if="layout == 'list'">
				<div class="col-md-12">
					<ul v-bind:class="{ 'shops-list-mobile': mobile, 'shops-list': !mobile, 'with-links': action}">
						<li class="shops-list-header" v-if="!mobile">
							<div class="name">
								Название и адрес
							</div>
							<div class="metro">
								Станция метро
							</div>
							<div class="phone text-center">
								Телефон
							</div>
							<div class="hours text-center">
								Время работы
							</div>	
						</li>
						<li class="shops-list-item" v-for="shop in filteredShops" :key="shop.id" itemtype="http://schema.org/Organization">
							<template v-if="!mobile">
								<div class="name">
									<strong v-html="shop.name"></strong>
									<div class="address">
										<template v-if="shop.number"><div class="number">{{ shop.number }}</div></template>
										<span itemprop="streetAddress" v-html="shop.address"></span>
									</div>
								</div>
								<div class="metro">
									<template v-if="shop.metro"><div><i class="metro-icon"></i>&nbsp;{{ shop.metro }}</div></template>
									<template v-if="shop.metro == null">&nbsp;</template>
								</div>
								<div class="phone">
									{{ shop.phone }}
								</div>
								<div class="hours">
									<div>{{ shop.worktime_weekdays ? "Пн-Пт (" + shop.worktime_weekdays + ")" : '&nbsp;' }}</div>
									<div v-if="shop.worktime_weekends">{{ shop.worktime_weekends ? "Сб-Вс (" + shop.worktime_weekends + ")" : '&nbsp;' }}</div>
								</div>
								<div class="action" v-if="shop.button">
									<div v-html="shop.button"></div>
									<a href="#" class="change-point" v-if="activeItem == shop.id" v-on:click.prevent="activeItem = false">Выбрать другой</a>
								</div>
							</template>

							<template v-if="mobile">
								<div class="row">
									<div v-bind:class="{ 'col-xs-12': !shop.button, 'col-xs-7': shop.button}">
										<template v-if="shop.metro"><div class="metro"><i class="metro-icon"></i>&nbsp;{{ shop.metro }}</div></template>
										<strong v-html="shop.name"></strong>
										<div class="address">
											<template v-if="shop.number"><div class="number">{{ shop.number }}</div></template>
											<span itemprop="streetAddress" v-html="shop.address"></span>
										</div>
										<div class="hours">
											<div v-if="shop.worktime_weekdays">{{ "Пн-Пт (" + shop.worktime_weekdays + ")" }}</div>
											<div v-if="shop.worktime_weekends">{{ "Сб-Вс (" + shop.worktime_weekends + ")" }}</div>
										</div>
									</div>
									<div class="col-xs-5 action-box" v-if="shop.button">
										<div v-html="shop.button"></div>
										<a href="#" class="change-point" v-if="activeItem == shop.id" v-on:click.prevent="activeItem = false">Выбрать другой</a>
									</div>
								</div>
							</template>
						</li>
					</ul>
				</div>
			</div>
			<div class="row">
				<div class="col-md-9" id="shops-map" v-if="layout == 'map'">
					<yandex-map :coords="mapCenter"
						zoom="12"
						style="width: 100%; height: 720px;"
						:controls="['trafficControl', 'zoomControl', 'geolocationControl']"
						:placemarks="this.placemarks"
						@map-was-initialized="mapInitHandler"
					>
					</yandex-map>
				</div>
				<div class="col-md-9" id="shops-metro" v-if="layout == 'metro'">
					<!-- <yandex-map 
						:coords=mapCenter
						zoom="10"
						style="width: 100%; height: 720px;"
						:controls="['zoomControl']"
						:placemarks="this.placemarks"
					>
					</yandex-map> -->
				</div>
				<div id="shops-map-list" class="shops-map-list col-md-3" data-simplebar data-simplebar-autohide="false" v-if="layout == 'map' || layout == 'metro'">
					<div class="shop-list-box">
						<ul>
							<li class="shops-list-item" v-for="shop in filteredShops" :key="shop.id">
								<div class="name">
									<strong v-html="shop.name"></strong>
									<div class="address">
										<template v-if="shop.number">Номер:&nbsp;{{ shop.number }}<br /></template>
										Адрес: <span v-html="shop.address"></span><br>
										<template v-if="shop.metro">Метро:&nbsp;{{ shop.metro }}</template>
									</div>
								</div>
								<div class="hours" v-if="shop.worktime_weekdays">
									<span>{{ shop.worktime_weekdays ? "Пн-Пт (" + shop.worktime_weekdays + ")" : '&nbsp;' }}</span><br>
									<span>{{ shop.worktime_weekends ? "Сб-Вс (" + shop.worktime_weekends + ")" : '' }}</span>
								</div>
								<div class="phone" v-if="shop.phone">
									{{ shop.phone }}
								</div>
								<div class="action clearfix" v-if="shop.button">
									<div v-html="shop.button" class="select-point-list"></div>
									<a href="#" class="change-point" v-if="activeItem == shop.id" v-on:click.prevent="activeItem = false">Выбрать другой</a>
								</div>
							</li>
						</ul>
					</div>
				</div>
			</div>
		</template>
	</div>
</template>

<script>
export default {
	props: {
		shops: {
			type: Object,
			required: true
		}, 
		activeCity: {
			type: String
		},
		searchString: {
			type: String
		},
		mode: {
			type: String
		},
		action: {
			type: [String, Boolean],
			default: false
		},
		active: {
			type: [Number, Boolean, String],
			default: false
		}
	},

	data: function () {
		return {
			mapCenter: [0, 0],
			layout: 'map',
			mapFilter: [],
			notFound: false,
			postamats: this.postamats || {},
			showSearch: false,
			mobile: false,
			shops_array: this.shops,
			activeItem: this.active || false
		}
	},
	computed: {
		filteredShops: function () {
			//this.shops[this.activeCity] || this.postamats[this.activeCity] || []
			let items = [];
			let searchString = this.searchString;
			let activeItem = this.activeItem;

			if (this.shops_array[this.activeCity] != undefined && this.shops_array[this.activeCity].length > 0) {

				this.shops_array[this.activeCity].forEach(function(item, i, arr) {
					item.type = "shop";
					items.push(item);
				});
			}

			if (this.mode == 'postamats' || this.mode == 'shops' && this.shops_array[this.activeCity] == undefined) {
				if (this.postamats[this.activeCity] != undefined && this.postamats[this.activeCity].length > 0) {
					this.postamats[this.activeCity].forEach(function(item, i, arr) {
						item.type = "pickpoint";
						items.push(item);
					});
				}
			}

			if (activeItem) {
				let active = [];
				for (var i = items.length - 1; i >= 0; i--) {
					if (activeItem == items[i].id) {
						active.push(items[i]);
					}
				}

				if (active.length > 0) {
					items = active;
				}
			}

			if (searchString){
				searchString = searchString.trim().toLowerCase();

				items = items.filter(function(item){
					if(item.name.toLowerCase().indexOf(searchString) !== -1){
						return item;
					}
					
					if(item.metro != null && item.metro.toLowerCase().indexOf(searchString) !== -1){
						return item;
					}

					if(item.address != null && item.address.toLowerCase().indexOf(searchString) !== -1){
						return item;
					}
				})
			}

			items = this.getBalloonContent(items);

			if (items[0] != undefined) {
				this.mapCenter = [items[0].latitude, items[0].longitude];
			}

			// Возвращает массив с отфильтрованными данными.
			return items;
		},
		placemarks: function () {
			var points = [];
			if (this.filteredShops.length > 0) {
				for (var i = 0; i < this.filteredShops.length; i++) {
					let shop = this.filteredShops[i];

					if (shop.latitude) {
						points.push(
							{
								coords: [shop.latitude, shop.longitude],
								properties: {
									hintContent: shop.name,
									balloonContent: shop.balloonContent,
									balloonContentHeader: shop.name,
								},
								options: {
									iconLayout: 'default#image',
									iconImageHref: '/include/shops/' + (shop.type == 'shop' ? 'placemark-dadget.png' : 'placemark.png'), 
									iconiIageSize: [38, 49], 
									iconImageOffset: [-8, -19],
									balloonMaxWidth: 300,
									balloonOffset: [-110, 0]
								}
							}
						);
					}
				}
			}

			return points;
		}
	},
	methods: {
		mapInitHandler: function(map){
			map.setBounds(map.geoObjects.getBounds(), {checkZoomRange: true}).then(function(){
				if(map.getZoom() > 16) map.setZoom(16);
			});
		},
    getShops: function(){
      if (this.shops_array.length == 0) {
        this.$http.get('/local/templates/dadget/include/offices.php').then(response => { 
          if(!!response.body) {
            this.shops_array = response.body;
          }
        }, (response) => {
          this.shops_array = [];
        });
      }
    },
    getPostamats: function(){
      this.$http.get('/local/templates/dadget/include/postamats.php').then(response => {
        if(!!response.body) {
          this.postamats = response.body;
        }
      }, (response) => {
        this.postamats = [];
      });
		},
		getBalloonContent(items) {
			for (var i = items.length - 1; i >= 0; i--) {
				items[i].balloonContent = '<div class="balloonWrap">';
					
					if (items[i].number != undefined){
						items[i].balloonContent += '<div class="balloonNumber">' + items[i].number + '</div><br />';
					}

					items[i].balloonContent += '<div class="balloonAddress">' + items[i].address + "</div>";

					if (items[i].metro != null){
						items[i].balloonContent += '<br /><div class="balloonMetro"><i class=\"metro-icon\"></i>&nbsp;' + items[i].metro + '</div>';
					}

					if (items[i].phone != null){
						items[i].balloonContent += '<br /><div class="balloonPhone">' + items[i].phone + '</div>';
					}

					if (items[i].worktime_weekdays != null){
						items[i].balloonContent += '<br /><div class="balloonWork">Пн - Пт (' + items[i].worktime_weekdays + ')';

						if (items[i].worktime_weekends != null){
							items[i].balloonContent += '<br />Сб - Вс (' + items[i].worktime_weekends + ')';
						}

						items[i].balloonContent += '</div>';
					}

					items[i].button = this.getButton(items[i]);

					if (items[i].button) {
						items[i].balloonContent += '<hr />';
						items[i].balloonContent += items[i].button;
					}

				items[i].balloonContent += '</div>';
			}

			return items;
		},
		setActive(event) {
			this.activeItem = event.target.dataset.id;
		},
		getButton(item) {
			if (this.action == 'product') {
				return '<button class="button select-point ' + (item.id == this.activeItem ? 'active' : '') + '" data-type="' + item.type + '" data-id="' + item.id + '">Забрать отсюда</button>';
			}

			return false;
		}
	},
  created: function(){
  	if (this.mode == 'postamats') {
    	this.getPostamats();
  	}

  	if (document.body.clientWidth > 767) {
  		this.showSearch = true
  	} else {
  		this.mobile = true
  	}
  },
  mounted: function(){
  	if (this.shops_array[this.activeCity] == undefined && this.mode == 'shops') {
    	this.getPostamats();
  	}
  },
  beforeUpdate: function(){
  	if (this.shops_array[this.activeCity] == undefined && this.postamats[this.activeCity] == undefined) {
  		this.notFound = true;
  	} else {
  		this.notFound = false;
  	}
  }
}
</script>