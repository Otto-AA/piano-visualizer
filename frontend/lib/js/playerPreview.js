export default class PlayerPreview {
	constructor () {
		this.iframeWindow = undefined;
	}
	setPreviewContainer(selector) {
		this.previewContainer = $(selector);
	}
	load(maxLoadingTime=5000) {
		const $iframeWrap = $('<div class="aspect-ratio aspect-ratio-2-1"></div>');
		const $iframe = $('<iframe src="/user/_default/" style="display: none;">');
		$iframe.hide();
		$iframeWrap.append($iframe);
		this.previewContainer.append($iframeWrap);

		this.$iframe = $iframe;
		this.$iframeWindow = $iframe;
		
		return new Promise((resolve, reject) => {
			$iframe.on('load', () => {
				resolve();
			});
			setTimeout(() => { reject(); }, maxLoadingTime);
		});
	}
	show() {
		this.$iframe.show();
	}
	hide() {
		this.$iframe.hide();
	}
	setDesign(design) {
		if (this.$iframe.get(0).contentWindow === null)
			return false;
		const contentWindow = this.$iframe.get(0).contentWindow;
		contentWindow.design.applyDesign(design);
	}	
}