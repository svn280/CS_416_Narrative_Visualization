let data = null;
let currScene = null;
let initLoad = true;
const margin = {top: 60, right: 150, bottom: 60, left: 80};
width = 800 - margin.left - margin.right,
height = 400 - margin.top - margin.bottom;

var svg = d3.select("#visualization").append("svg")
     .attr("width", 1200)
     .attr("height", 400)
     .append("g")
       .attr("transform",
             "translate(" + margin.left + "," + margin.top + ")");

d3.csv("Airplane_Crashes_and_Fatalities_Since_1908.csv").then(myDat => {
   data = myDat.map(d => ({
    date: new Date(d.Date),
    year: +d.Date.split('/')[2],
    decade: Math.floor(+d.Date.split('/')[2] / 10) * 10,
    fatalities: +d.Fatalities,
    aboard: +d.Aboard || 0,
    operator: d.Operator || 'UNK', 
    type: d.Type || 'UNK',
    location: d.Location || 'UNK',
    summary: d.Summary || ''
   })).filter(d => d.year >= 1920 && d.year <= 2020 && !isNaN(d.fatalities));
   
   
   drawScene1();
});

function drawScene1() {
    currScene = "1";

    svg.selectAll("*").remove();

    var xScale = d3.scaleLinear()
        .domain([1920, 2020])
        .range([0, width]);
    
    svg.append("g")
       .attr("transform", "translate(0, " + height + ")")
       .call(d3.axisBottom(xScale).tickFormat(d3.format("d")));
    
    const yearlyData = d3.rollup(data,
                v => d3.sum(v, d => d.fatalities),
                d => d.year
        );
    
    
    const lineData = Array.from(yearlyData, ([year, fatalities]) => ({
            year: year,
            fatalities: fatalities
        })).sort((a, b) => a.year - b.year);

    var yScale = d3.scaleLinear()
        .domain([0, d3.max(lineData, d => d.fatalities)])
        .range([height, 0]);
    
    svg.append("g")
     .call(d3.axisLeft(yScale));

     const line = d3.line()
         .x(d => xScale(d.year))
         .y(d => yScale(d.fatalities));

    svg.append("path")
      .datum(lineData)
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 1.5)
      .attr("d", line);
      
    svg.append("text")
        .attr("class", "x label")
        .attr("text-anchor", "end")
        .attr("x", width - (margin.left * 3))
        .attr("y", height + (margin.bottom/2))
        .text("Year");
      
    svg.append("text")
        .attr("class", "y label")
        .attr("text-anchor", "end")
        .attr("y", -1 * margin.left/1.5)
        .attr("dy", ".75em")
        .attr("transform", "rotate(-90)")
        .text("Total Fatalities");
    
    d3.select("#narrative")
      .html(`
        <h2> An Analysis of Air Safety</h2>
        <p> Commercial aviation used to be very dangerous 
        in the eary to mid 20th century, but has now evolved
        into a much safer means of transport. This line chart
        shows the total fatalities over the decades starting from
        1920 to 2020.</p>
        <p> The main takeaway is that there has been a sharp
        decline in fatalities over the past 20 to 30 years, 
        which is notable given how many more people use planes 
        in the modern day.
        `)
       
}




