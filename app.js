const canvasContainer = document.getElementById('canvas-container');
const canvas1 = new fabric.Canvas('canvas', {
    preserveObjectStacking: true,
    width: canvasContainer.clientWidth,
    height: canvasContainer.clientHeight,
});
const maskCanvas = new fabric.Canvas('maskcanvas', {
    preserveObjectStacking: true,
    width: canvasContainer.clientWidth,
    height: canvasContainer.clientHeight,
});
var canvas=canvas1;
const context = canvas.getContext('2d');


class Mask {
    constructor() {
      this.checkbox = document.getElementById("btn-check-outlined");
      this.maskcanvas = document.getElementById("drawcanvas1");
      this.canvas1 = canvas1;      
      this.checkbox.addEventListener("change", this.handleCheckboxChange.bind(this));
    }
  
    handleCheckboxChange() {
      if (this.checkbox.checked) {
        canvas=maskCanvas;
        this.maskcanvas.style.display = "block";
      } else {
        canvas=canvas1;
        this.maskcanvas.style.display = "none";
      }
    }
  }
  document.addEventListener("DOMContentLoaded", function () {
    const pageManager = new Mask();
  });

   
//tải ảnh lên
const openFileButton = document.getElementById('load-image');
openFileButton.addEventListener('click', function() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.style.display = 'none';
    input.addEventListener('change', function(e) {
        const file = e.target.files[0];
        fabric.Image.fromURL(URL.createObjectURL(file), function(img) {
            const originalWidth = img.width;
            const originalHeight = img.height;
            canvas.setWidth(originalWidth);
            canvas.setHeight(originalHeight);
            //canvas.clear();s
            canvas.add(img);
            canvas.renderAll();
        });
    });
    input.click();
});

//lưu canvas thành png
const downloadButton = document.getElementById('downloadButton');
downloadButton.addEventListener('click', function() {
    const url = canvas.toDataURL({
        format: 'png',
        multiplier: 1
    });
    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.download = 'image.png';
    downloadLink.click();
});


//set bg color canvas
class CanvasBackgroundSetter {
    constructor(canvasId, colorInputId, buttonId) {
        this.canvas = document.getElementById(canvasId);
        this.colorInput = document.getElementById(colorInputId);
        this.setColorButton = document.getElementById(buttonId);

        this.setColorButton.addEventListener("click", this.setCanvasBackgroundColor.bind(this));
    }

    setCanvasBackgroundColor() {
        const color = this.colorInput.value;
        this.canvas.style.backgroundColor = color;
    }
}

// Khởi tạo một đối tượng CanvasBackgroundSetter
const canvasSetter = new CanvasBackgroundSetter("canvas", "ColorInput", "set-canvas-color");






function zoomInAll() {
    canvas.forEachObject(function(obj) {
        obj.scaleX *= 1.2;
        obj.scaleY *= 1.2;
    });
    canvas.renderAll();
}
document.getElementById('zoomInButton').addEventListener('click', () => {
    zoomInAll();
});

function zoomOutAll() {
    canvas.forEachObject(function(obj) {
        obj.scaleX /= 1.2;
        obj.scaleY /= 1.2;
    });
    canvas.renderAll();
}
document.getElementById('zoomOutButton').addEventListener('click', () => {
    zoomOutAll();
});





const history = [];
let currentState = -1;
canvas.on('mouse:down', () => {
    currentState++;
    if (currentState < history.length) {
        history.length = currentState;
    }
    const snapshot = JSON.stringify(canvas.toJSON()); // Lưu trạng thái hiện tại của canvas
    history.push(snapshot);
});

function undo() {
    if (currentState > 0) {
        currentState--;
        canvas.loadFromJSON(history[currentState], () => {
            canvas.renderAll();
        });
    }
}
const undoButton = document.getElementById('undoButton');
undoButton.addEventListener('click', undo);

function redo() {
    if (currentState < history.length - 1) {
        currentState++;
        canvas.loadFromJSON(history[currentState], () => {
            canvas.renderAll();
        });
    }
}
const redoButton = document.getElementById('redoButton');
redoButton.addEventListener('click', redo);



//quay trái
function rotateLeft() {
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
        activeObject.rotate(activeObject.angle - 90);
        canvas.renderAll();
    }
}
const rotateLeftButton = document.getElementById('rotateLeftButton');
rotateLeftButton.addEventListener('click', rotateLeft);

//quay phải
function rotateRight() {
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
        activeObject.rotate(activeObject.angle + 90);
        canvas.renderAll();
    }
}
const rotateRightButton = document.getElementById('rotateRightButton');
rotateRightButton.addEventListener('click', rotateRight);
//lật dọc
function flipHorizontal() {
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
        activeObject.flipX = !activeObject.flipX;
        canvas.renderAll();
    }
}
const flipHorizontalButton = document.getElementById('flipHorizontalButton');
flipHorizontalButton.addEventListener('click', flipHorizontal);
//lật ngang
function flipVertical() {
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
        activeObject.flipY = !activeObject.flipY;
        canvas.renderAll();
    }
}
const flipVerticalButton = document.getElementById('flipVerticalButton');
flipVerticalButton.addEventListener('click', flipVertical);

//xóa đối tượng đang chọn
function deleteSelectedObject() {
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
        canvas.remove(activeObject);
        canvas.renderAll();
    }
}
document.addEventListener('keydown', function (event) {
    if (event.key === 'Delete') {
        deleteSelectedObject();
    }
});

//pointer mode
function stopDrawing () {
    canvas.isDrawingMode = false;
    enableSelectionAndMovement();
    isDrawingMode = false;
    canvas.renderAll();
}
const StopDrawing = document.getElementById('pointer');
StopDrawing.addEventListener('click', stopDrawing);





//vẽ tự do
const colorPicker = document.getElementById('colorPicker1');
const dropdownItems = document.querySelectorAll('.pen-size');
const penButton = document.getElementById('pen');
var selectedPenSize = 5;

penButton.addEventListener('click', onStartDrawing);

colorPicker.addEventListener('input', function () {
    const selectedColor = colorPicker.value;
    canvas.freeDrawingBrush.color = selectedColor;
});

dropdownItems.forEach(function (item) {
    item.addEventListener('click', function () {
        const selectedSize = item.getAttribute('data-size');
        canvas.freeDrawingBrush.width = parseInt(selectedSize);       
        size=parseInt(selectedSize);
    });
});
var size=1;

function onStartDrawing() {
    isDrawingMode = false;
    canvas.isDrawingMode = true;
    const defaultColor = colorPicker.value;   
    canvas.freeDrawingBrush.color = defaultColor;
    canvas.freeDrawingBrush.width = parseInt(size);
    
}
//tẩy
// function onEraser(){
//     canvas.freeDrawingBrush = new fabric.EraserBrush();
//     canvas.freeDrawingBrush.width = 10;
//     canvas.isDrawingMode = true;    
// }
// var onEraserButton = document.getElementById('eraser');
// onEraserButton.addEventListener('click', onEraser);


//tạo hình vuông
function createSquare() {
    var square = new fabric.Rect({
        left: 100,
        top: 100,
        width: 100,
        height: 100,
        fill:'',
        strokeWidth: parseInt(size), // Sử dụng độ rộng nét đã chọn
        stroke: colorPicker.value // Màu của nét viền (đen trong trường hợp này)
        
    });
    canvas.add(square);
}
var createSquareButton = document.getElementById('createSquare');
createSquareButton.addEventListener('click', createSquare);


function createCircle() {
    canvas.add(new fabric.Circle({ radius: 50, fill: '', top: 150, left: 150, stroke: colorPicker.value ,strokeWidth: parseInt(size) }));
}
var createCircleButton = document.getElementById('createCircle');
createCircleButton.addEventListener('click', createCircle);



//vẽ đường thẳng
let isDrawingMode = false;
let line;

function startDrawingLine(pointer) {
  const points = [pointer.x, pointer.y, pointer.x, pointer.y];
  line = new fabric.Line(points, {
    stroke: colorPicker.value,
    strokeWidth: size,
  });
  canvas.add(line);
}

function updateLineEndPoint(pointer) {
  line.set({ x2: pointer.x, y2: pointer.y });
  canvas.renderAll();
}

canvas.on('mouse:down', (event) => {
  if (isDrawingMode) {
    const pointer = canvas.getPointer(event.e);
    startDrawingLine(pointer);
  }
});

canvas.on('mouse:move', (event) => {
  if (isDrawingMode && line) {
    const pointer = canvas.getPointer(event.e);
    updateLineEndPoint(pointer);
  }
});

canvas.on('mouse:up', () => {
  if (isDrawingMode) {
    line = null;
  }
});

function disableSelectionAndMovement() {
    canvas.selection = false; // Tắt chế độ chọn (Selection Mode)
    canvas.forEachObject((obj) => {
      obj.selectable = false;
      obj.evented = false;
    });
  }
  
function enableSelectionAndMovement() {
canvas.selection = true; // Bật lại chế độ chọn (Selection Mode)
canvas.forEachObject((obj) => {
    obj.selectable = true;
    obj.evented = true;
});
}
// Hàm để bật/tắt chế độ vẽ đường thẳng
function toggleDrawingMode() {
  isDrawingMode = !isDrawingMode;
  if (isDrawingMode) {
    disableSelectionAndMovement();
  } else {   
    enableSelectionAndMovement();
  }

  if (!isDrawingMode && line) {
    canvas.remove(line);
  }
}

// Gán sự kiện click cho nút "Bật/Tắt Đường Thẳng"
const lineButton = document.getElementById('line');
lineButton.addEventListener('click', toggleDrawingMode);



//viết chữ
let fWeight="normal";
const boldButton = document.getElementById('bold');
boldButton.addEventListener('click', function () {
    if (boldButton.classList.contains('active')) {
        fWeight = "bold"; 
    } else {
        fWeight = "normal"; 
    }
});

let fStyle="normal";
const italicButton = document.getElementById('italic');
italicButton.addEventListener('click', function () {
    if (italicButton.classList.contains('active')) {
        fStyle = "italic"; 
    } else {
        fStyle = "normal"; 
    }
});
let fFamily="Time New Roman";
function setFontFamily(font) {
    fFamily = font;
}
let fSize=20;
function setFontSize(fontS) {
    fSize = fontS;
}
function addText(){
    stopDrawing();
    var itext = new fabric.IText('This is a IText object', {
        left: 100,
        top: 150,
        fill: colorPicker.value,
        strokeWidth: 2,
        stroke: "",
        fontStyle:fStyle,
        fontWeight:fWeight,  
        fontFamily:fFamily,
        fontSize:fSize,
    });
    canvas.add(itext);
}
var addTextBtn = document.getElementById('addText');
addTextBtn.addEventListener('click', addText);



//sepia
function applySepia() {
    var activeObject = canvas.getActiveObject();
    if (activeObject && activeObject.filters) {
        activeObject.filters.push(new fabric.Image.filters.Sepia());
        activeObject.applyFilters();
        canvas.renderAll();
    }
}
var sepiaButton = document.getElementById('sepia');
sepiaButton.addEventListener('click', applySepia);
//blur
function applyBlur() {
    var activeObject = canvas.getActiveObject();
    if (activeObject && activeObject.filters) {
        activeObject.filters.push(new fabric.Image.filters.Convolute({
            matrix: [0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1],
        }));
        activeObject.applyFilters();
        canvas.renderAll();
    }
}
var blurButton = document.getElementById('blur');
blurButton.addEventListener('click', applyBlur);
//opacity
function applyOpacity() {
    var activeObject = canvas.getActiveObject();
    if (activeObject) {
        activeObject.set({ opacity: 0.5 });
        canvas.renderAll();
    }
}
var opacityButton = document.getElementById('opacity');
opacityButton.addEventListener('click', applyOpacity);




function applyDefault() {
    var activeObject = canvas.getActiveObject();
    if (activeObject) {
        // Xóa tất cả các bộ lọc hiện tại trên đối tượng
        activeObject.filters = [];
        activeObject.applyFilters();
        canvas.requestRenderAll(); // Sử dụng requestRenderAll thay cho renderAll
    }
}

var defaultButton = document.getElementById('default-filter');
defaultButton.addEventListener('click', applyDefault);

//filter-warm
function applyWarm() {
    var activeObject = canvas.getActiveObject();
    if (activeObject) {
        // Tạo một bộ lọc tùy chỉnh để điều chỉnh màu sắc
        var warmFilter = new fabric.Image.filters.ColorMatrix({
            matrix: [
                1, 0, 0, 0, 0.1, // Điều chỉnh độ đỏ
                0, 1, 0, 0, 0,
                0, 0, 1, 0, 0, // Điều chỉnh độ xanh
                0, 0, 0, 1, 0
            ]
        });
        // Đặt bộ lọc cho đối tượng và áp dụng chúng
        activeObject.filters.push(warmFilter);
        activeObject.applyFilters();
        canvas.requestRenderAll(); // Sử dụng requestRenderAll thay cho renderAll
    }
}

var warmButton = document.getElementById('warm-filter');
warmButton.addEventListener('click', applyWarm);
//filter-cold
function applyCool() {
    var activeObject = canvas.getActiveObject();
    if (activeObject) {
        // Tạo một bộ lọc tùy chỉnh để điều chỉnh màu sắc
        var coolFilter = new fabric.Image.filters.ColorMatrix({
            matrix: [
                1, 0, 0, 0, 0, // Điều chỉnh độ đỏ
                0, 1, 0, 0, 0,
                0, 0, 1, 0, 0.1, // Điều chỉnh độ xanh
                0, 0, 0, 1, 0 // Điều chỉnh độ lạnh
            ]
        });
        // Đặt bộ lọc cho đối tượng và áp dụng chúng
        activeObject.filters.push(coolFilter);
        activeObject.applyFilters();
        canvas.requestRenderAll(); // Sử dụng requestRenderAll thay cho renderAll
    }
}

var coolButton = document.getElementById('cold-filter');
coolButton.addEventListener('click', applyCool)

//filter-grayscale
function applyGrayScale() {
    var activeObject = canvas.getActiveObject();
    if (activeObject) {
        // Tạo một bộ lọc tùy chỉnh để chuyển đổi thành hình ảnh trắng đen
        var grayScaleFilter = new fabric.Image.filters.ColorMatrix({
            matrix: [
                0.33, 0.33, 0.33, 0, 0, // Điều chỉnh độ đỏ
                0.33, 0.33, 0.33, 0, 0, // Điều chỉnh độ xanh
                0.33, 0.33, 0.33, 0, 0, // Điều chỉnh độ lục
                0, 0, 0, 1, 0
            ]
        });
        // Đặt bộ lọc cho đối tượng và áp dụng chúng
        activeObject.filters.push(grayScaleFilter);
        activeObject.applyFilters();
        canvas.requestRenderAll(); // Sử dụng requestRenderAll thay cho renderAll
    }
}

var grayScaleButton = document.getElementById('gray-scale-filter');
grayScaleButton.addEventListener('click', applyGrayScale);






// function applyInvert() {
//     var activeObject = canvas.getActiveObject();
//     if (activeObject) {
//         // Tạo một bộ lọc tùy chỉnh để đảo ngược màu sắc
//         var invertFilter = new fabric.Image.filters.ColorMatrix({
//             matrix: [
//                 -1, 0, 0, 0, 255, // Đảo ngược độ đỏ
//                 0, -1, 0, 0, 255, // Đảo ngược độ xanh
//                 0, 0, -1, 0, 255, // Đảo ngược độ lục
//                 0, 0, 0, 1, 0
//             ]
//         });
//         // Đặt bộ lọc cho đối tượng và áp dụng chúng
//         activeObject.filters.push(invertFilter);
//         activeObject.applyFilters();
//         canvas.requestRenderAll(); // Sử dụng requestRenderAll thay cho renderAll
//     }
// }

// var invertButton = document.getElementById('invert-filter');
// invertButton.addEventListener('click', applyInvert);