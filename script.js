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
   })).filter(d => d.year >= 1920 && d.year <= 2010 && !isNaN(d.fatalities));

   drawScene1();
});

function drawScene1() {
    currScene = "1";

    svg.selectAll("*").remove();

    var xScale = d3.scaleLinear()
        .domain([1920, 2010])
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
        in the early to mid 20th century, but has now evolved
        into a much safer means of transport. This line chart
        shows the total fatalities over the decades starting from
        1920 to 2010.</p>
        <p> The main takeaway is that there has been a sharp
        decline in fatalities over the past 20 to 30 years, 
        which is notable given how many more people use planes 
        in the modern day.</p>
        <button id="scene2-btn" onclick="drawScene2()">Explore WWII Era -></button>
        `)
}

function drawScene2() {
    currScene = "1";

    svg.selectAll("*").remove();

    var xScale = d3.scaleLinear()
        .domain([1939, 1950])
        .range([0, width]);
    
    svg.append("g")
       .attr("transform", "translate(0, " + height + ")")
       .call(d3.axisBottom(xScale).tickFormat(d3.format("d")));
    
    const ww2Data = data.filter(d => d.year >= 1939 && d.year <= 1950);

    const yearlyData = d3.rollup(ww2Data,
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

    const path = svg.append("path")
      .datum(lineData)
      .attr("fill", "none")
      .attr("stroke", "darkred")
      .attr("stroke-width", 3)
      .attr("d", line);
    
    const pathLength = path.node().getTotalLength();

    path
      .attr("stroke-dashoffset", pathLength)
      .attr("stroke-dasharray", pathLength)
      .transition()
      .duration(2500)
      .attr("stroke-dashoffset", 0);
      
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
        .text("Aviation Fatalities WWII");
    
    const annotationLeft = [
        {
            year: 1941,
            label: "US enters the war",
            dy: -100,
            dx: 0
        }
    ];


    const annotationYear = lineData.find(d => d.year === annotationLeft[0].year);

    const annotations = [{
        note: {
            label: annotationLeft[0].label,
            title: "December 1941"
        },
        x: xScale(annotationLeft[0].year),
        y: yScale(annotationYear.fatalities),
        dy: annotationLeft[0].dy,
        dx:0
    }];

    const makeAnnotations = d3.annotation()
         .annotations(annotations);
    
    svg.append("g")
       .attr("class", "annotation-group")
       .call(makeAnnotations);
    
       const annotationRight = [
        {
            year: 1945,
            label: "End of war",
            dy: -30
        }
      ];

      const annotationRightYear = lineData.find(d => d.year === annotationRight[0].year);
    
      const annotationRightLabel = [{
        note: {
            label: annotationRight[0].label,
            title: "September 1945"
        },
        x: xScale(annotationRight[0].year),
        y: yScale(annotationRightYear.fatalities),
        dy: annotationRight[0].dy,
        dx:0
    }];

    const makeAnnotationRight = d3.annotation()
         .annotations(annotationRightLabel);
    
    svg.append("g")
       .attr("class", "annotation-group")
       .call(makeAnnotationRight);
            

    d3.select("#narrative")
      .html(`
        <h2> The Impact of World War II</h2>
        <p> There is a sharp rise in fatalities from 1939 to 1950. There 
        were many military accidents along with civilian aircraft losses that occurred
        amidst the intense fighting.</p>
        <p> Examine the peak that occurred during 1941 - 1945. The US was actively fighting
        during this period and aviation technology was also rapidly advancing, leading to
        a greater loss of life. After 1945, the deaths begin to decline, as the 
        technological advances made during the war were applied to civil aviation.</p>
        <button id="scene1-btn" onclick="drawScene1()">Back to Overview -></button>
        <button id="scene3-btn" onclick="drawScene3()">Explore the Data -></button>
        `)
}

function drawScene3() {
    currScene = "3";

    svg.selectAll("*").remove();

    var xScale = d3.scaleTime()
        .domain([new Date(1990, 0, 1), new Date(2010, 11, 31)])
        .range([0, width]);
    
    svg.append("g")
       .attr("transform", "translate(0, " + height + ")")
       .call(d3.axisBottom(xScale));
    
    const recentData = data.filter(d => d.year >= 1990 && d.year <= 2010);

    var yScale = d3.scaleLinear()
        .domain([0, d3.max(recentData, d => d.fatalities)])
        .range([height, 0]);
    
    svg.append("g")
     .call(d3.axisLeft(yScale));

    
    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    svg.selectAll("circle")
       .data(recentData)
       .enter().append("circle")
       .attr("cx", d => xScale(d.date))
       .attr("cy", d => yScale(d.fatalities))
       .attr("r", 5)
       .on("mouseover", function(event, d) {
            d3.select(this)
              .transition()
              .duration(2000)
              .attr("r", 8)
              .attr("opacity", 1);

            tooltip.transition()
              .duration(200)
              .style("opacity", 0.9);
            
            tooltip.html(`
                <strong>${d.date.toLocaleDateString()}</strong><br/>
                Airline: ${d.operator}<br/>
                Aircraft: ${d.type}<br/>
                Location: ${d.location}<br/>
                Fatalities: ${d.fatalities}<br/>
                Total Aboard: ${d.aboard}
            `)
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 28) + "px");
       }).on("mouseout", function(d) {
          d3.select(this)
              .transition()
              .duration(500)
              .attr("r", 5)
              .attr("opacity", 0.6);

            tooltip.transition()
              .duration(500)
              .style("opacity", 0);
       })
       .on("click", function(event, d) {
          d3.select("#narrative").append("div")
                .attr("class", "accident-detail")
                .style("background", "#f0f0f0")
                .style("padding", "10px")
                .style("margin", "10px 0")
                .style("border-left", "4px solid #ff6b6b")
                .html(`
                    <h4>${d.date.toLocaleDateString()} - ${d.operator}</h4>
                    <p>${d.summary}</p>
                `);
       })
      
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
        .text("Fatalities");

    d3.select("#narrative")
      .html(`
        <h2> Interactive Exploration of Recent Aviation</h2>
        <p> Looking at recent years, from 1990 to 2009, shows how much aviation safety 
            has improved, as there are fewer accidents and the majority of those 
            are less catastrophic.</p>
        <h3> Explore </h3>
        <ul>
          <li> Hover over the dots to see accident details.</li>
          <li> Click on the dots to view a summary of the accidents </li>
        <button id="scene1-btn" onclick="drawScene1()">Back to Overview -></button>
        <button id="scene2-btn" onclick="drawScene2()">Explore WWII Era -></button>
        `)
}




