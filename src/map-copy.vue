<template lang="html">
    <div class="pure-g">
        <div class="pure-u-1 pure-u-lg-1-2 list">
            <h2 class="filials">Филиалы и представительства</h2>
            <div class="offices-lists">
                <div v-for="officesChunk in offices" class="offices-list">
                    <div class="office" v-for="office in officesChunk" @click="setMapCenter(office)" :class="{active: office.id == activeOffice.id}">
                        {{ office.title }}
                    </div>
                </div>
            </div>
            <a class="button" data-remodal-target="wholesaler">Стать оптовиком</a>
        </div>

        <div class="pure-u-1 pure-u-lg-1-2 map">
            <div id="map-box"></div>
        </div>
    </div>
</template>

<script>
	export default {
        props: ['offices'],

		data: function () {
			return {
				map: {},
                activeOffice: this.offices[0][0],
				ready: false
			}
		},

		mounted() {
			const vm = this;

			window.ymaps.ready(function () {
				vm.map = new ymaps.Map('map-box', {
					center: [vm.activeOffice.latitude, vm.activeOffice.longitude],
					controls: [],
					zoom: 16
				});

				vm.offices.forEach(chunk => {
					chunk.forEach(office => {
						let myPlacemark = new ymaps.Placemark([office.latitude, office.longitude], {
							balloonContentHeader: `<b>${office.title}</b>`,
							balloonContentBody: office.contacts,
							balloonContentFooter: office.phone,
						}, {
							balloonCloseButton: false,
						});
						vm.map.geoObjects.add(myPlacemark);
					});
				});

				vm.ready = true;
				vm.map.behaviors.disable('scrollZoom');
            });

            $('.offices-lists').slick({
                dots: true,
                arrows: false,
                fade: true,
            });

            $('#map-box').height($('.list').outerHeight());
		},
		methods: {
			setMapCenter(office) {
				if (!this.ready) {
					return;
				}

				this.map.setCenter([office.latitude, office.longitude]);
				this.activeOffice = office;
			}
		}
	}
</script>