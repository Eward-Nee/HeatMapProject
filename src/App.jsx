import { useEffect, useRef } from "react"
import * as d3 from "d3"
import "./app.css"

function App() {
  let toolTip = useRef()
  const svgAttr = {
    class: "svgHeatMap",
    margin: {
      top: 110,
      bottom: 0,
      left: 0,
      right: 0,
    }
  }

  const mapAttr = {
    width: 1400,
    height: 400,
    margin: {
      top: 40,
      bottom: 40,
      left: 60,
      right: 40,
    }
  }

  useEffect(() => {
    d3.select(".svgContainer").selectAll("svg").remove()
    // svg conf
    const svg = d3
      .select(".svgContainer")
      .append("svg")
      .attr("width", mapAttr.width + mapAttr.margin.left + mapAttr.margin.right)
      .attr("height", mapAttr.height + mapAttr.margin.bottom + mapAttr.margin.top)
      .attr("class", svgAttr.class)
      .attr("style", `margin:${svgAttr.margin.top}px ${svgAttr.margin.right}px ${svgAttr.margin.bottom}px ${svgAttr.margin.left}px;`)

    // g conf
    const g = svg.append("g").attr("transform", `translate(${mapAttr.margin.left},${mapAttr.margin.top})`)

    d3.json("https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json").then((data) => {
      // var
      const baseTemp = data.baseTemperature
      let arrData = data.monthlyVariance

      // color scale
      const colorScale = d3.scaleSequential()
        .domain(d3.extent(arrData, t => t.variance))
        .interpolator(d3.interpolateCividis)

      render(baseTemp, arrData, colorScale)

    })

    function render(baseTemp, arrData, colorScale) {
      const uMonths = [...new Set(arrData.map(d => d.month))]
      const uYears = [...new Set(arrData.map(d => d.year))]
      // x
      const x = d3.scaleBand()
        .domain(uYears)
        .range([0, mapAttr.width])

      g.append("g")
        .attr("transform", `translate(0,${mapAttr.height})`)
        .attr("id", "x-axis")
        .call(d3.axisBottom(x).tickValues(uYears.filter((_, i) => i % 5 === 0)))
        .attr("class", "tick")
        .selectAll("text")

      // y
      const y = d3.scaleBand()
        .domain(uMonths)
        .range([0, mapAttr.height])

      g.append("g")
        .attr("id", "y-axis")
        .call(d3.axisLeft(y).tickFormat((d) => {
          const arrMonths = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
          ]

          return arrMonths[d - 1]
        }))
        .attr("class", "tick")

      // blocks
      const blocks = g.selectAll("rect")
        .data(arrData)
        .enter()
        .append("rect")

      blocks.attr("width", x.bandwidth())
        .attr("height", y.bandwidth())
        .attr("x", d => x(d.year))
        .attr("y", d => y(d.month))
        .attr("fill", d => colorScale(d.variance))
        .attr("data-month", d => d.month - 1)
        .attr("data-year", d => d.year)
        .attr("data-temp", d => (Math.round((d.variance + baseTemp) * 1000)) / 1000)
        .attr("class", "cell")
        .on("mouseover", (e, d) => {
          d3.select(toolTip.current)
            .style("left", e.pageX + 20 + "px")
            .style("top", e.pageY + 20 + "px")
            .text(`Year: ${d.year}, Month: ${d.month}, Temp: ${(Math.round((d.variance + baseTemp) * 1000)) / 1000}`)
            .transition()
            .duration(500)
            .attr("hidden", null)
            .style("opacity", 0.8)
            .attr("data-year", d.year)
        })
        .on("mouseout", () => {
          d3.select(toolTip.current)
            .attr("hidden", "")
            .style("opacity", 0)
            .attr("data-year", "")
        })

      // tooltip
      d3.select(toolTip.current)
        .style("position", "absolute")
        .style("opacity", 0)
        .style("background", "black")
        .style("color", "white")
        .style("border", "1px solid black")
        .style("padding", "5px")
        .style("border-radius", "5px")
        .style("pointer-events", "none")

      // legend
      d3.select("#legend").selectAll("*").remove()

      const legend = d3.select("#legend")
        .append("svg")
        .attr("width", 600)
        .attr("height", 50)

      let colors = []

      for (let i = 0; i <= 10; i++) {
        colors.push(d3.interpolateCividis(i / 10))
      }

      colors.forEach((color, index) => {
        legend.append("rect")
          .attr("width", 400 / colors.length)
          .attr("height", 50)
          .attr("x", 100 + index * (400 / colors.length))
          .attr("fill", color)
      })

      legend.append("text")
        .attr("x", 50)
        .attr("y", 30)
        .attr("text-anchor", "middle")
        .text("Min Value")

      legend.append("text")
        .attr("x", 550)
        .attr("y", 30)
        .attr("text-anchor", "middle")
        .text("Max Value")

    }
  }, [])

  return (
    <>
      <div id="tooltip" ref={toolTip} hidden></div>
      <div id="title">Heat Map by Eward</div>
      <div id="description">Heat Map of temperature</div>
      <div className="svgContainer"></div>
      <legend id="legend"></legend>
    </>
  )
}

export default App