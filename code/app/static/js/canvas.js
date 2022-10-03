const canvas = document.querySelector('#canvas');
const chart_canvas = document.querySelector('#chart');
const chart= chart_canvas.getContext('2d');
const ctx = canvas.getContext('2d');
const classify = document.querySelector('#classify_button');
const clear = document.querySelector('#clear_button');
const canvas_size=350;
const chart_width=620;
const chart_height=300;
var myChart;

var popoverTriggerList = [].slice.call(
  document.querySelectorAll('[data-bs-toggle="popover"]')
);
var popoverList = popoverTriggerList.map(function (popoverTriggerEl) {
  return new bootstrap.Popover(popoverTriggerEl);
});

window.post = function(url, data) {
  return fetch(url, {method: "POST", headers: {'Content-Type': 'application/json'}, body: JSON.stringify(data)});
}

clear.addEventListener('click',()=>{
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    myChart.destroy();
}, false);

//classify.addEventListener('click',()=>{
//  const image=canvas.toDataURL();
//  const link=document.createElement('a');
//  link.href=image;
//  link.download='canvas_image.png'
//  link.click();
//});



window.addEventListener('load',()=>{
    
    canvas.width=canvas_size;
    canvas.height=canvas_size;
    chart_canvas.width=chart_width;
    chart_canvas.height=chart_height;

    // Variables
    let drawing=false;

    function  getMousePos(e) {
      var rect = canvas.getBoundingClientRect(), // abs. size of element
        scaleX = canvas.width / rect.width,    // relationship bitmap vs. element for x
        scaleY = canvas.height / rect.height;  // relationship bitmap vs. element for y

      return {
        x: (e.clientX - rect.left) * scaleX,   // scale mouse coordinates after they have
        y: (e.clientY - rect.top) * scaleY     // been adjusted to be relative to element
      }
    }
    
    function begin_position(e){
        drawing=true;
        draw(e)
    }

    function end_position(){
        drawing=false;
        ctx.beginPath();
    }
    
    function draw(e){
        if (drawing === false) return;
        ctx.lineWidth=50;
        ctx.lineCap='round';
        var mousePos=getMousePos(e);
        
        var x=mousePos['x'];
        var y=mousePos['y'];
      
        ctx.lineTo(x,y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x,y);

    }
    canvas.addEventListener("mousedown",begin_position);
    canvas.addEventListener("mouseup",end_position);
    canvas.addEventListener("mousemove",draw);
});

classify.addEventListener("click", ()=>{
  function createChart(x,y,result){

    result_bg_color='rgba(255, 99, 132, 0.2)';
    result_bdr_color='rgba(255, 99, 132, 1)';
    normal_bg_color='rgba(54, 162, 235, 0.2)';
    normal_bdr_color='rgba(54, 162, 235, 1)';
    bgColors=[];
    bdrColors=[];
    for (let val of x) {
      if ( val == result ) {
          bgColors.push(result_bg_color);
          bdrColors.push(result_bdr_color);
      } else {
          bgColors.push(normal_bg_color);
          bdrColors.push(normal_bdr_color);
      }
    }

    if (myChart != undefined || myChart != null) {
      myChart.destroy();
    }

    myChart = new Chart(chart, {
      type: 'bar',
      data: {
          labels: x,
          datasets: [{
              data: y,
              backgroundColor: bgColors, 
              borderColor: bdrColors,
              borderWidth: 1
          }]
      },
      options: {
          scales: {
              x: {
                  title: {
                    display: true,
                    text: 'Numbers'
                  }
              },
              y: {
                  beginAtZero: true,
                  title: {
                    display: true,
                    text: 'Percentage(%)'
                  }
              }
          },
          // responsive: true,
          maintainAspectRatio: false,
          legend:{
            display:false
          },
          title:{
            display: true,
            text: 'Classification: ' + result
          }
      },
    });
  }
  var img_size=500;
  var shift= (img_size-canvas_size)/2;
//  var data = ctx.getImageData(0, 0, size, size).data;
  var data = ctx.getImageData(x=-1*shift,y=-1*shift,width=img_size,length=img_size).data;
  var alphas = [];
  for(var i = 0, n = data.length; i < n; i += 4) {
    alphas.push(data[i+3])
  }
  var payload={"length":img_size,"width":img_size, "data":alphas};
  post('/predict',payload)
    .then(response=> response.json())
    .then(data=>{ 
      var data= JSON.parse(data); 
      var x=data["x"];
      var y=data["y"];
      var result=data["result"];
      createChart(x=x,y=y,result=result);
    });
});
