Array.prototype.contains = function(val){
	for(let i in this){
		if(val == this[i]){
			return true;
		}
	}
	return false;
};
//App从手机相册获取图片操作,支持多张图片获取,默认支持9张
var galleryImgs = (options) => {
	//#ifdef APP-PLUS
	let resolve = options.success || function(res){};
	let maximum = options.count || 9;
	let fail = options.fail;
	let complete = options.complete;
	plus.gallery.pick(function(e) {
	    resolve({tempFilePaths: e.files});
	    complete && complete(e);
	}.bind(this), function(e) {
	   fail && fail(e);
	   complete && complete(e);
	}.bind(this), {  
		filter: "image",
		multiple: true,
		maximum:maximum
	}); 
	//#endif
};
//App通过照相获取图片，
var getCameraImage = (options) => {
	//#ifdef APP-PLUS
	let resolve = options.success || function(res){};
	let fail = options.fail;
	let complete = options.complete;
	plus.camera.getCamera().captureImage(function(file) {
	   let res = {tempFilePaths:[file]};
	   resolve(res);
	   complete && complete(e);
	}.bind(this), function(e) {
	   fail && fail(e);
	   complete && complete(e);
	}.bind(this), {  
		filter: "image"
	});  
	//#endif
};
//App读取文件操作
//type TEXT || DATA_URL
var readFileAndResolve = (file,type,resolve,fail)=>{
	//#ifdef APP-PLUS
	let readType = type || 'TEXT';
	plus.io.resolveLocalFileSystemURL(file, function(entry) {
		// 可通过entry对象操作文件 
		entry.file(function(file){
			let fileReader = new plus.io.FileReader();
			fileReader[readType == 'TEXT' && 'readAsText' || 'readAsDataURL'](file,'utf-8');
			fileReader.onloadend = function(evt) {
				resolve(evt.target.result);
			}
		}.bind(this));
	}.bind(this), function ( e ) {
		fail && fail(e);
	}.bind(this));
	//#endif
};
var applus = {
	//count	Number	否	最多可以选择的图片张数，默认9	见下方说明
	//sizeType	Array<String>	否	original 原图，compressed 压缩图，默认二者都有	App、微信小程序、支付宝小程序、百度小程序
	//sourceType Array<String>	否	album 从相册选图，camera 使用相机，默认二者都有。如需直接开相机或直接选相册，请只使用一个选项
	//success Function	是	成功则返回图片的本地文件路径列表 tempFilePaths
	//fail	Function	否	接口调用失败的回调函数
	//complete	Function	否	接口调用结束的回调函数（调用成功、失败都会执行）
	chooseImage:(options)=>{
		let opts = options || {};
		var bts = opts.sourceType && [...opts.sourceType.contains('camera')&&[{  
			title: "拍照"  
		}]||[],...opts.sourceType.contains('album')&&[{  
			title: "从手机相册选择"  
		}]||[]] || [{  
			title: "拍照"  
		}, {  
			title: "从手机相册选择"  
		}]; 
		//#ifdef APP-PLUS
		plus.nativeUI.actionSheet({  
				cancel: "取消",  
				buttons: bts  
			},  
			function(e) {
				bts.length == 1 && (opts.sourceType.contains('camera')
					&& getCameraImage(options) || galleryImgs(options))
				||(function(){if (e.index == 1) {
					getCameraImage(options);
				} else if (e.index == 2) { 
					galleryImgs(options);
				}}.bind(this)());
			}.bind(this) 
		);
		//#endif
	},
	image2Base64:(imageUrl,resolve,fail)=>{
		readFileAndResolve(imageUrl,'DATA_URL',resolve,fail);
	}
};

export default applus;