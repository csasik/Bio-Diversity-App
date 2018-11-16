function buildMetadata(sample) {

    console.log('inside buildMetadata');
    d3.select("#sample-metadata")
        .html("");

    var wfreq = ""

    d3.json(`/metadata/${sample}`).then(function(response) {

      //console.log(response); 
  
      Object.entries(response).forEach(([key, value]) => {
        console.log(`${key} ${value}`);

        if(key == 'WFREQ'){
          wfreq = parseInt(value);
          console.log(value);
          buildGauge(wfreq); 
        }
        
        d3.select("#sample-metadata")
          .append("div")  
          .text(`${key} : ${value}`)
             });


    } );  

   

}

// BONUS: Build the Gauge Chart
function buildGauge(wfreq) {

console.log('inside buildGauge');
console.log(wfreq);

// Enter a speed between 0 and 180
var level = wfreq * 20;
console.log(level);

// Trig to calc meter point
var degrees = 180 - level,
     radius = .5;
var radians = degrees * Math.PI / 180;
var x = radius * Math.cos(radians);
var y = radius * Math.sin(radians);

// Path: may have to change to create a better triangle
var mainPath = 'M -.0 -0.025 L .0 0.025 L ',
     pathX = String(x),
     space = ' ',
     pathY = String(y),
     pathEnd = ' Z';
var path = mainPath.concat(pathX,space,pathY,pathEnd);

var data = [{ type: 'scatter',
   x: [0], y:[0],
    marker: {size: 28, color:'850000'},
    showlegend: false,
    name: 'frequency',
    text: level,
    hoverinfo: 'text+name'},
  { values: [50, 50/9, 50/9, 50/9, 50/9, 50/9,50/9, 50/9, 50/9, 50/9],
  rotation: 90,
  text: ['','8-9','7-8','6-7','5-6','4-5','3-4','2-3','1-2','0-1'],
  textinfo: 'text',
  textposition:'inside',
  marker: {colors:['rgba(255, 255, 255, 0)','rgba(14, 127, 0, .5)', 'rgba(110, 154, 22, .5)',
                         'rgba(170, 202, 42, .5)', 'rgba(202, 209, 95, .5)',
                         'rgba(210, 206, 145, .5)', 'rgba(232, 226, 202, .5)',
                         ]},
  labels: ['151-180', '121-150', '91-120', '61-90', '31-60', '0-30', ''],
  hoverinfo: 'label',
  hole: .5,
  type: 'pie',
  showlegend: false
}];

var layout = {
  shapes:[{
      type: 'path',
      path: path,
      fillcolor: '850000',
      line: {
        color: '850000'
      }
    }],
  title: 'Belly Button Wash Frequency',
  height: 500,
  width: 500,
  xaxis: {zeroline:false, showticklabels:false,
             showgrid: false, range: [-1, 1]},
  yaxis: {zeroline:false, showticklabels:false,
             showgrid: false, range: [-1, 1]}
};

Plotly.newPlot('gauge', data, layout);

}

function buildCharts(sample) {

  // @TODO: Use `d3.json` to fetch the sample data for the plots

    // @TODO: Build a Bubble Chart using the sample data

    // @TODO: Build a Pie Chart
    // HINT: You will need to use slice() to grab the top 10 sample_values,
    // otu_ids, and labels (10 each).
    console.log('inside buildChart');

    d3.json(`/samples/${sample}`).then(function(response) {

      //console.log(response);

      
      let sample_array = [];
      let otu_ids = response.otu_ids;
      let otu_labels = response.otu_labels;
      let sample_values = response.sample_values;

      otu_ids.forEach(function(data, index){
        let sample_dict = {};

        sample_dict['otu_id'] = otu_ids[index];
        sample_dict['otu_labels'] = otu_labels[index];
        sample_dict['sample_values'] = sample_values[index];

        sample_array[index] = sample_dict;
      })
        
      sample_array.sort(function(a, b) {
        return parseInt(b.sample_values) - parseInt(a.sample_values)   
      })

       console.log( sample_array.slice(0,10));
      
      let size = sample_values ;
     
        let trace = {
        type: "pie",
        name: "Sample Values",
        //text:  sample_array.map(data => data.otu_labels).slice(0,10),
        labels: sample_array.map(data => data.otu_id).slice(0,10),
        values: sample_array.map(data => data.sample_values).slice(0,10),
            };

        let trace2 = {
          text: otu_labels,
          x: otu_ids,
          y: response.sample_values,
          mode : 'markers',
          marker: {
            size: response.sample_values, 
            color: otu_ids
          }
        }    

        let layout1 = {
          title:"Sample Values"
                   };
      

        let layout2 = {
          title:"Sample Metadata",
          xaxis:{title:'OTU_ID'},
          yaxis:{title:'Values'},
          hovermode:'closest',
          width:1100,
          height:500
         };
      
      
       let pie_data = [trace];
       let bubble_data = [trace2];

       //console.log(pie_data);

       Plotly.newPlot("pie", pie_data, layout1);
       Plotly.newPlot("bubble", bubble_data, layout2);


    });
}

function init() {
  // Grab a reference to the dropdown select element
  var selector = d3.select("#selDataset");
  //console.log('inside init');
  // Use the list of sample names to populate the select options
  d3.json("/names").then((sampleNames) => {
    sampleNames.forEach((sample) => {
      selector
        .append("option")
        .text(sample)
        .property("value", sample);
    });

    // Use the first sample from the list to build the initial plots
    const firstSample = sampleNames[0];
    console.log(firstSample);

    buildCharts(firstSample);
    buildMetadata(firstSample);
  });
}

function optionChanged(newSample) {
  // Fetch new data each time a new sample is selected
  console.log('option changed');
  buildCharts(newSample);
  buildMetadata(newSample);
}

// Initialize the dashboard
init();
