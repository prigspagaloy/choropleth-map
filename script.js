const body = d3.select("body")
               .append("div")
               .attr("id", "main")

      body.append("div")
          .attr("id", "title")
          .append("h1")
          .text("United States Educational Attainment")
          .style("text-align", "center")

      body.append("div")
          .attr("id", "description")
          .append("h4")
          .text("Percentage of adults age 25 and older with a bachelor's degree or higher (2010-2014)")
          .style("text-align", "center")

const svg = body.append("div")
                .attr("id", "svg-container")
                .append("svg")
                .attr("width", 960)
                .attr("height", 650)

const legend = svg.append("g")
                  .attr("id", "legend")

const tooltip = body.append("div")
                    .style("opacity", "0")

const EDUCATION_FILE = "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json";

const COUNTY_FILE = "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json";

Promise.all([d3.json(COUNTY_FILE), d3.json(EDUCATION_FILE)]).then(data => dataFile(data[0], data[1])).catch(err => console.error(err))

const dataFile = (us, education) => {
const country = topojson.feature(us, us.objects.counties).features;

svg.selectAll("path")
   .data(country)
   .enter()
   .append("path")
   .attr("d", d3.geoPath())
   .attr("class", "county")
   .attr("fill", (d) => {
    const countyID = d.id;
    const county = education.find(data => data.fips === countyID);
    const percentage = county.bachelorsOrHigher;
        if (percentage <= 15) {
            return "#bcd2e8"
        } else if (percentage <= 30) {
            return "#73A5C6"
        } else if (percentage <= 45) {
            return "#2E5984"
        } else {
            return "#1e3f66"
        }
    })    
    .attr("data-fips", d => d.id)
    .attr("data-education", d => {
    const countyID = d.id;
    const county = education.find(data => data.fips === countyID);
    const percentage = county.bachelorsOrHigher;
        return percentage;
    })
    .on("mouseover", (event, d) => {
        let result = education.filter(obj => obj.fips === d.id)
        tooltip.style("opacity", "0.9")
               .style("position", "absolute")
               .style("left", event.pageX - 50 + "px")
               .style("top", event.pageY - 50 + "px")
               .style("pointer-events", "none")
               .style("background-color", "hsla(49 26% 91% / 0.84)")
               .style("padding", "10px")
               .style("border-radius", "10px")
               .attr("id", "tooltip")
               .attr("data-education", result[0].bachelorsOrHigher)
        tooltip.html(() => {
             result = education.filter(obj => obj.fips === d.id)
            if (result[0]) {
                return result[0].area_name + ", " + result[0].state + ": " + result[0].bachelorsOrHigher + "%"
            }
        })
    })
    .on("mouseout", () => {
        tooltip.style("opacity", "0")
    })
let legendRange = education.map(obj => obj.bachelorsOrHigher)
let xmin = d3.min(legendRange)
let xmax = d3.max(legendRange); console.log(xmax)
let lmin = d3.format(".0%")(xmin/100);
let lmax = d3.format(".0%")(xmax/100);
    const x = d3.scaleLinear()
                .domain([d3.min(legendRange), d3.max(legendRange)])
                .range([20, 200])
    const xAxis = d3.axisBottom(x)
                    //.tickFormat(d3.format(".0%"))
    legend.append("g")
          .call(xAxis)
          .attr("transform", "translate(630, 50)")
    
    legend.append("g")
          .selectAll("rect")
          .data(legendRange)
          .enter()
          .append("rect")
          .attr("fill", d => {
            const percentage = d;
            if (d <= 15) {
                return "#bcd2e8"
            } else if (d <= 30) {
                return "#73A5C6"
            } else if (d <= 45) {
                return "#2E5984"
            } else {
                return "#1e3f66"
            }
          })
          .attr("legendRange", d => { 
            return d
            })
          .attr("x", (d) => x(d) + 630)
          .attr("y", 34)
          .attr("width", 1)
          .attr("height", 15)
          
      body.append("div")
          .attr("id", "source")
          .text("Source: ")
          .append("a")
          .attr("href", "https://www.ers.usda.gov/data-products/county-level-data-sets/download-data.aspx")
          .text("USDA Economic Research Service")

   }