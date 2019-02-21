<template lang="html">
	<div class="map-widget">
		<div class="map-tabs">
			<div class="row">
				<div class="col-md-6">
					<div class="map-filters" v-if="this.showFilter">
						<input type="checkbox" value="pickpoint" v-model="mapFilter">
						<label for="pickpoint">постаматы Pickpoint</label>
						<input type="checkbox" value="shop" v-model="mapFilter">
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
		<template v-if="this.notFound && this.mapFilter.length != 0 && this.loaded">
			<div class="notfound-message">
				К сожалению в вашем городе нет фирменных магазинов Даджета и постаматов Pickpoint. Вы можете заказать товар с доставкой Почтой России.
			</div>
		</template>
		<template v-if="this.shopsNotFound && this.loaded == true && this.mode == 'contacts'">
			<div class="pickpoint-message">
				Пока нашего магазина нет в вашем городе. Товар можно заказать с доставкой и забрать в удобном постамате Pickpoint.
			</div>
		</template>
		<template v-if="this.shopsNotFound && this.loaded == true && this.mode == 'product'">
			<div class="pickpoint-message">
				Пока этого товара нет в магазинах вашего города. Вы можете заказать его с доставкой и забрать в удобном постамате Pickpoint.
			</div>
		</template>
		<template v-if="filteredShops.length == 0 && searchString != '' || this.mapFilter.length == 0">
			<div class="message">
				По вашему запросу ничего не найдено.
			</div>
		</template>
		<template v-if="!this.loaded">
			<div class="map-loading" style="height: 100px;"></div>
		</template>
		<template v-if="filteredShops.length > 0">
			<div class="row" id="shops-list" v-if="layout == 'list'" data-simplebar data-simplebar-autohide="false">
				<div class="col-md-12">
					<ul v-bind:class="{ 'shops-list-mobile': mobile, 'shops-list': !mobile, 'with-links': action}">
						<li class="shops-list-header" v-if="!mobile">
							<div class="name">
								Название и адрес
							</div>
							<div class="metro">
								Станция метро
							</div>
							<div class="amount" v-if="mode == 'product'">
								Наличие
							</div>
							<div class="phone text-center">
								Телефон
							</div>
						</li>
						<li class="shops-list-item" v-for="shop in filteredShops" :key="shop.id" itemtype="http://schema.org/Organization">
							<template v-if="!mobile">
								<div class="name">
									<template v-if="action == 'link'">
										<a :href="'/shops/' + shop.id + '/'"><strong v-html="shop.name"></strong></a>
									</template>
									<template v-if="action != 'link'">
										<strong v-html="shop.name"></strong>
									</template>
									<div class="address">
										<template v-if="shop.number"><div class="number">Номер:&nbsp;{{ shop.number }}</div></template>
										<div class="payment" v-if="(shop.cash || shop.card) && shop.type == 'pickpoint'">
											Способы оплаты:
											<span v-if="shop.cash && shop.card">наличные, карта.</span>
											<span v-else-if="shop.cash && !shop.card">наличные.</span>
											<span v-else-if="!shop.cash && shop.card">карта.</span>
											<span v-if="shop['amount-to'] > 0" class="amountTo"><br />Оплата на месте не более {{ shop["amount-to"] }} руб.</span>
										</div>
										Адрес: <span itemprop="streetAddress" v-html="shop.address"></span>
									</div>
								</div>
								<div class="metro">
									<template v-if="shop.metro"><div><i class="metro-icon"></i>&nbsp;{{ shop.metro }}</div></template>
									<template v-if="shop.metro == null">&nbsp;</template>
								</div>
								<div class="amount" v-if="mode == 'product'">
									<template v-if="shop.amount == null">&nbsp;</template>
									<template v-if="shop.amount == 0"><span class="red">нет</span></template>
									<template v-if="shop.amount == 1">
										<i class="amount-line-red"></i><i class="amount-line-grey"></i><i class="amount-line-grey"></i><br><span class="amount-text">товар<br />заканчивается</span>
									</template>
									<template v-if="shop.amount == 2">
										<i class="amount-line"></i><i class="amount-line"></i><i class="amount-line-grey"></i>
									</template>
									<template v-if="shop.amount > 2">
										<i class="amount-line"></i><i class="amount-line"></i><i class="amount-line"></i>
									</template>
								</div>
								<div class="phone">
									{{ shop.phone }}
								</div>
								<div class="action" v-if="shop.button">
									<div v-html="shop.button"></div>
									
									<template v-if="action != 'link'">
										<a href="#" class="change-point" v-if="activeItem == shop.id" v-on:click.prevent="activeItem = false">Выбрать другой</a>
									</template>
									<template v-if="action == 'link'">
										<a href="/shops/" class="change-point" v-if="activeItem == shop.id" v-on:click="activeItem = false">Все магазины</a>
									</template>
								</div>
							</template>

							<template v-if="mobile">
								<div class="row">
									<div v-bind:class="{ 'col-xs-12': !shop.button, 'col-xs-7': shop.button}">
										<template v-if="shop.metro"><div class="metro"><i class="metro-icon"></i>&nbsp;{{ shop.metro }}</div></template>
										<template v-if="action == 'link'">
											<a :href="'/shops/' + shop.id + '/'"><strong v-html="shop.name"></strong></a>
										</template>
										<template v-if="action != 'link'">
											<strong v-html="shop.name"></strong>
										</template>
										<div class="address">
											<template v-if="shop.number"><div class="number">Номер:&nbsp;{{ shop.number }}</div></template>
											<div class="payment" v-if="(shop.cash || shop.card) && shop.type == 'pickpoint'">
												Способы оплаты:
												<span v-if="shop.cash && shop.card">наличные, карта.</span>
												<span v-else-if="shop.cash && !shop.card">наличные.</span>
												<span v-else-if="!shop.cash && shop.card">карта.</span>
												<span v-if="shop['amount-to'] > 0" class="amountTo"><br />Оплата на месте не более {{ shop["amount-to"] }} руб.</span>
											</div>
											<span itemprop="streetAddress" v-html="shop.address"></span>
										</div>
										<div class="hours">
											<div v-if="shop.worktime_weekdays">{{ "Пн-Пт (" + shop.worktime_weekdays + ")" }}</div>
											<div v-if="shop.worktime_weekends">{{ "Сб-Вс (" + shop.worktime_weekends + ")" }}</div>
										</div>
									</div>
									<div class="col-xs-5 action-box" v-if="shop.button">
										<div v-html="shop.button"></div>
										<template v-if="action != 'link'">
											<a href="#" class="change-point" v-if="activeItem == shop.id" v-on:click.prevent="activeItem = false">Выбрать другой</a>
										</template>
										<template v-if="action == 'link'">
											<a href="/shops/" class="change-point" v-if="activeItem == shop.id" v-on:click="activeItem = false">Все магазины</a>
										</template>
									</div>
								</div>
							</template>
						</li>
					</ul>
				</div>
			</div>
			<div class="row">
				<div class="col-md-9" id="shops-map" v-if="layout == 'map'">
					<yandex-map 
						:coords="mapCenter" 
						zoom="12" 
						style="width: 100%; height: 720px;" 
						:controls="['trafficControl', 'zoomControl', 'geolocationControl']" 
						:placemarks="this.placemarks" 
						@map-was-initialized="mapInitHandler" 
						:init-without-markers="false"
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
									<template v-if="action == 'link'">
										<a :href="'/shops/' + shop.id + '/'"><strong v-html="shop.name"></strong></a>
									</template>
									<template v-if="action != 'link'">
										<strong v-html="shop.name"></strong>
									</template>
									<div class="address">
										<template v-if="shop.number">Номер:&nbsp;{{ shop.number }}<br /></template>
										<div class="payment" v-if="(shop.cash || shop.card) && shop.type == 'pickpoint'">
											Способы оплаты:
											<span v-if="shop.cash && shop.card">наличные, карта.</span>
											<span v-else-if="shop.cash && !shop.card">наличные.</span>
											<span v-else-if="!shop.cash && shop.card">карта.</span>
											<span v-if="shop['amount-to'] > 0" class="amountTo"><br />Оплата на месте не более {{ shop["amount-to"] }} руб.</span>
										</div>
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
									
									<template v-if="action != 'link'">
										<a href="#" class="change-point" v-if="activeItem == shop.id" v-on:click.prevent="activeItem = false">Выбрать другой</a>
									</template>
									<template v-if="action == 'link'">
										<a href="/shops/" class="change-point" v-if="activeItem == shop.id" v-on:click="activeItem = false">Все магазины</a>
									</template>
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
//Mode: contacts, product, order
export default {
	props: {
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
		},
		productShops: {
			type: Object
		},
		activeLayout: {
			type: String,
			default: 'map'
		}
	},
	data: function () {
		return {
			mapCenter: [0, 0],
			showFilter: false,
			mapFilter: ['shop'],
			notFound: false,
			shopsNotFound: false,
			showSearch: false,
			mobile: false,
			loaded: false,
			points: [],
			layout: this.activeLayout,
			activeItem: this.active || false,
			city: this.activeCity || "",
			domen: "https://shop.dadget.ru"
		}
	},
	computed: {
		filteredShops: function () {
			let items = [];
			let searchString = this.searchString;
			let activeItem = this.activeItem;
			//let filter = this.mapFilter;

			if (this.points.length > 0) {
				this.points.forEach(function(item, i, arr) {
					items.push(item);
				});
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

			// if (filter.length == 1) {
			// 	items = items.filter(function(item){
			// 		if(item.type == filter[0]){
			// 			return item;
			// 		}
			// 	});
			// }

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
			let points = [];
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
									balloonContentHeader: this.action == "link" ? '<a href="' + this.domen + '/shops/' + shop.id + '/">' + shop.name + '</a>' : shop.name,
								},
								options: {
									iconLayout: 'default#image',
									iconImageHref: '/include/shops/' + (shop.type == 'shop' ? 'placemark-dadget.png' : 'placemark.png'), 
									iconiIageSize: [38, 49], 
									iconImageOffset: [-8, -19],
									balloonMaxWidth: 300,
									balloonMaxHeight: 520,
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
				if(map.getZoom() > 17) map.setZoom(17);
			});
		},
    getPoints: function(){
    	let params = {};
    	params.city = this.city;
    	this.shopsNotFound = false;

    	if (this.mapFilter.length == 1) {
				params.type = this.mapFilter[0];    		
    	} else if (this.mapFilter.length == 2){
    		params.type = "all";
    	}

    	if (this.mode != 'product' && this.city.length > 0 && params.type != undefined) {
	    	if (this.mapFilter.length > 0) {
		      this.$http.get(this.domen + '/local/templates/dadget/include/points.php', {"params": params}).then(response => { 
		        if(!!response.body) {
		          this.points = response.body;

		          if (this.points.length > 0) {
		          	this.notFound = false;
		          	this.loaded = true;
		          } else {
					if (this.mode == "contacts") {
						this.getPickpoints();
					} else {
						this.notFound = true;
						this.loaded = true;
					}
		          }
		        }
		      }, (response) => {      	
		      	this.notFound = true;
		      	this.loaded = true;
		      });
	    	} else {
	    		this.notFound = true;
		      	this.loaded = true;
		      	this.points = [];
	    	}
    	} else {
    		if (this.productShops != undefined) {
    			this.points = this.productShops;
    		}
    	}
    },
    getPickpoints: function(city){
    	let params = {};
    	params.city = city || this.city;
    	params.type = "pickpoint";
    	this.loaded = false;

      this.$http.get(this.domen + '/local/templates/dadget/include/points.php', {"params": params}).then(response => { 
        if(!!response.body) {
          this.points = response.body;

          if (this.points.length > 0) {
						if (this.mode == "contacts" || this.mode == "product") {
							this.shopsNotFound = true;
						}
          	this.notFound = false;
          } else {
						this.notFound = true;
						this.shopsNotFound = false;
          }

          this.loaded = true;
        }
      }, (response) => {
      	this.notFound = true;
      	this.loaded = true;
      });
    },
		getBalloonContent(items) {
			for (var i = items.length - 1; i >= 0; i--) {
				items[i].balloonContent = '<div class="balloonWrap">';
					
					if (items[i].photo != undefined) {
						items[i].balloonContent += '<div class="balloonImage"><br /><img src="' + this.domen + items[i].photo + '" /></div><br />';
					}

					if (items[i].number != undefined){
						items[i].balloonContent += '<div class="balloonNumber">Номер:&nbsp;' + items[i].number + '</div><br />';
					}

					if (items[i].cash || items[i].card){
						items[i].balloonContent += '<div class="balloonPayment">Способы оплаты:&nbsp;';

						if (items[i].cash && items[i].card) {
							items[i].balloonContent += 'наличные, карта';
						} else {
							if (items[i].cash)
								items[i].balloonContent += 'наличные';

							if (items[i].card)
								items[i].balloonContent += 'карта';
						}

						if (items[i]["amount-to"] > 0) {
							items[i].balloonContent += '.<br /><span class="amountTo">Оплата на месте не более ' + items[i]["amount-to"] + ' руб.</span>';
						}

						items[i].balloonContent += '</div><br />';
					}

					items[i].balloonContent += '<div class="balloonAddress">' + items[i].address + "</div>";

					if (items[i].metro != null){
						items[i].balloonContent += '<br /><div class="balloonMetro"><i class=\"metro-icon\"></i>&nbsp;' + items[i].metro + '</div>';
					}

					if (items[i].amount != null && this.mode == "product" && items[i].type == "shop"){

						items[i].balloonContent += '<br />Наличие:&nbsp;&nbsp;';

						if (items[i].amount == 0)
							items[i].balloonContent += '<span class="red">нет</span><br />';

						if (items[i].amount == 1)
							items[i].balloonContent += '<i class="amount-line-red"></i><i class="amount-line-grey"></i><i class="amount-line-grey"></i> - <span class="amount-text">товар заканчивается</span><br />';

						if (items[i].amount == 2)
							items[i].balloonContent += '<i class="amount-line"></i><i class="amount-line"></i><i class="amount-line-grey"></i><br />';

						if (items[i].amount > 2)
							items[i].balloonContent += '<i class="amount-line"></i><i class="amount-line"></i><i class="amount-line"></i><br />';
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
		setCity(city) {
			this.city = city;
		},
		getButton(item) {
			let number = 0;

			if (this.action == 'link') {
				return '<a href="' + this.domen + "/shops/" + item.id + '/" class="open-shop button ' + (item.id == this.activeItem ? 'active' : '') + '" data-type="' + item.type + '" data-id="' + item.id + '" data-name="' + item.name + '" data-number="' + number + '">Подробнее</a>';
			} else if (this.action == 'product') {
				if (item.type == 'pickpoint') {
					number = item.number;
				} else {
					number = item.id;
				}

				return '<button class="button select-point ' + (item.id == this.activeItem ? 'active' : '') + '" data-type="' + item.type + '" data-id="' + item.id + '" data-name="' + item.name + '" data-number="' + number + '">Забрать отсюда</button>';
			}

			return false;
		}
	},
  created: function(){
  	if (document.body.clientWidth > 767) {
  		this.showSearch = true
  	} else {
  		this.mobile = true
  	}
  },
	mounted: function () {
	  this.$nextTick(function () {
	    this.getPoints();
	  })
	},
  watch: {
    mapFilter: function(){
    	this.loaded = false;
    	this.points = [];
      this.getPoints();
    },
    city: function(value){
    	if (value.length > 0) {    		
	    	this.loaded = false;
	    	this.points = [];
	      this.getPoints();
    	}
    }
  }
}
</script>