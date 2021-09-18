function init() {
  // Grab a reference to the dropdown select element
  var selector = d3.select("#selDataset");

  // Use the list of sample names to populate the select options
  d3.json("samples.json").then((data) => {
    console.log(data);
    var sampleNames = data.names;

    sampleNames.forEach((sample) => {
      selector
        .append("option")
        .text(sample)
        .property("value", sample);
    });

    // Use the first sample from the list to build the initial plots
    var firstSample = sampleNames[0];
    buildCharts(firstSample);
    buildMetadata(firstSample);
  });
}

// Initialize the dashboard
init();

function optionChanged(newSample) {
  // Fetch new data each time a new sample is selected
  buildMetadata(newSample);
  buildCharts(newSample);
  
}

// Demographics Panel 
function buildMetadata(sample) {
  d3.json("samples.json").then((data) => {
    var metadata = data.metadata;
    // Filter the data for the object with the desired sample number
    var resultArray = metadata.filter(sampleObj => sampleObj.id == sample);
    var result = resultArray[0];
    // Use d3 to select the panel with id of `#sample-metadata`
    var PANEL = d3.select("#sample-metadata");

    // Use `.html("") to clear any existing metadata
    PANEL.html("");

    // Use `Object.entries` to add each key and value pair to the panel
    // tags for each key-value in the metadata.
    Object.entries(result).forEach(([key, value]) => {
      PANEL.append("h6").text(`${key.toUpperCase()}: ${value}`);
    });

  });
}

// Create the buildCharts function.
function buildCharts(sample) {
  // Use d3.json to load and retrieve the samples.json file 
  d3.json("samples.json").then((data) => {
    // Create a variable that holds the samples array
    var samples = data.samples;
    // Create a variable that filters the samples for the object with the desired sample number
    var resultArray = samples.filter(sampleObj => sampleObj.id == sample);
    // Create a variable that holds the first sample in the array
    var result = resultArray[0]

    // Create variables that hold the otu_ids, otu_labels, and sample_values
    var id = result.otu_ids;
    var label = result.otu_labels;
    var value = result.sample_values;

    // Create the relative info for the bar chart
    var xticks = id.map(element => `OTU ${element}`).slice(0, 10).reverse();
    var yticks = value.slice(0, 10).reverse();
    var labels = label.slice(0, 10).reverse();

    // Create the trace for the bar chart 
    // x, y ticks exchanged to perform horizontal graph
    var barData = [{
      x: yticks,
      y: xticks,
      type:'bar',
      orientation: 'h',
      text: labels
    }];

    // Create the layout for the bar chart
    var barLayout = {
      title : 'Top 10 Bacteria Cultures Found'
    };

    // Use Plotly to plot the data with the layout
    Plotly.newPlot("bar",barData,barLayout);

    // Create the trace for the bubble chart
    var bubbleData = [{
      x: id,
      y: value,
      text: label,
      mode: 'markers',
      marker: {
        size: value,
        color: id,
        colorscale: 'Portland'
      }
    }];

    // Create the layout for the bubble chart
    var bubbleLayout = {
      title: 'Bacteria Cultures Per Sample',
      xaxis: {title: 'OTU ID'},
      automargin: true,
      hovermode: 'closest'
    };

    // Use Plotly to plot the data with the layout
    Plotly.newPlot("bubble", bubbleData, bubbleLayout);
    
    // Create a variable that filters the metadata array for the object with the desired sample number.
    var metadata = data.metadata;
    // Create a variable that holds the first sample in the array.
    var metaArray = metadata.filter(sampleObj => sampleObj.id == sample);

    // Create a variable that holds the first sample in the metadata array.
    var meta = metaArray[0];

    // Create a variable that holds the washing frequency.
    var washFreq = meta.wfreq;
    
    // Create the trace for the gauge chart.
    var gaugeData = [{
      domain:{ x:[0, 1], y:[0, 1]},
      value: washFreq,
      type: 'indicator',
      gauge:{
          axis: {range: [0, 10], dtick: 2},
          bar: {color: 'black'},
          steps: [
            {range: [0, 2], color: 'red'},
            {range: [2, 4], color: 'orange'},
            {range: [4, 6], color: 'yellow'},
            {range: [6, 8], color: 'lightgreen'},
            {range: [8, 10], color: 'green'}
          ],
          dtick:2
      },
      mode: 'gauge+number'
    }];
    
    // Create the layout for the gauge chart.
    var gaugeLayout = { 
      title: {text: "<b> Belly Button Washing Frequency </b> <br></br> Scrubs Per Week"},
      automargin: true
    };

    // Use Plotly to plot the gauge data and layout.
    Plotly.newPlot("gauge", gaugeData, gaugeLayout);
    });
}