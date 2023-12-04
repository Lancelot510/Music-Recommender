


  fetch('data/songs_details.csv')
    .then(response => response.text())
    .then(data => {

      processData(data);
    });


  function processData(csvData) {

    var rows = csvData.split('\n');
    var headers = rows[0].split(',');
    var data = [];
    var genreSet = new Set();
    for (var i = 1; i < rows.length; i++) {
      var values = rows[i].split(',');


      var tempo = parseFloat(values[11]);  

      var loudness = parseFloat(values[9]);
      var title = values[6];  
      var genre = values[0];  
      var year = parseInt(values[13]); 

      if (genre !== undefined) {
        data.push({ tempo, loudness, title, genre, year });
        genreSet.add(genre);
      }
    }


    var uniqueGenres = Array.from(genreSet);

    var colorScale = d3.scaleOrdinal(d3.schemeCategory20c);

    var yearDropdown = document.getElementById('year-dropdown');
    var uniqueYears = [...new Set(data.map(row => row.year))];
    uniqueYears.sort((a, b) => b - a); 

    uniqueYears.forEach(year => {
      var option = document.createElement('option');
      option.value = year;
      option.text = year;
      yearDropdown.add(option);
    });

    yearDropdown.addEventListener('change', function () {
      var selectedYear = this.value;
      updateChart(selectedYear);
    });

    updateChart(uniqueYears[0]);

    function updateChart(selectedYear) {
      var filteredData = data.filter(row => row.year == selectedYear);
      var traces = [];
      
      uniqueGenres.forEach(genre => {
        var genreData = filteredData.filter(row => row.genre === genre);

        var trace = {
          x: genreData.map(row => row.tempo),
          y: genreData.map(row => row.loudness),
          mode: 'markers',
          type: 'scatter',
          text: genreData.map(row => row.title),
          marker: {
            size: 5,
            color: colorScale(genre),
          },
          name: genre,
        };

        traces.push(trace);
      });


      var layout = {
        title: 'Tempo vs Loudness Scatter Plot',
        xaxis: { title: 'Tempo (beats per minute)' },
        yaxis: { title: 'Loudness (dB)' },
        showlegend: true,
        legend: {
            x: 1,  
            y: 1,  
            font: {
              family: 'Arial, sans-serif',
              size: 16,
              color: 'grey',
            }
          },
      };

      Plotly.newPlot('scatterplot', traces, layout);
    }
  }


    //======================================================================================

  Plotly.d3.csv('data/genreevolution.csv', function (err, data) {

    var lookup = {};
    function getData(year, genre) {
        var byYear, trace;
        if (!(byYear = lookup[year])) {;
        byYear = lookup[year] = {};
        }

        if (!(trace = byYear[genre])) {
        trace = byYear[genre] = {
            x: [],
            y: [],
            id: [],
            text: [],
            marker: {size: []}
        };
        }
        return trace;
    }

    for (var i = 0; i < data.length; i++) {
        var datum = data[i];
        var trace = getData(datum.year, datum.genre);
        trace.text.push("Song Count: "+datum.count+"<br>"+"Genre: "+datum.genre);
        trace.id.push(datum.genre);
        trace.x.push(datum.duration);
        trace.y.push(datum.song_hotttnesss);
        trace.marker.size.push(datum.count);
    }

    var years = Object.keys(lookup);
    var refyear = lookup[years[70]];
    var genres = Object.keys(refyear);

    var traces = [];
    for (i = 0; i < genres.length; i++) {
        var data = refyear[genres[i]];

        traces.push({
        name: genres[i],
        x: data.x.slice(),
        y: data.y.slice(),
        id: data.id.slice(),
        text: data.text.slice(),
        mode: 'markers',
        marker: {
            size: data.marker.size.slice(),
            sizemode: 'area',
            sizeref: 0.1
        }
        });
    }

    var frames = [];
    for (i = 0; i < years.length; i++) {
        frames.push({
        name: years[i],
        data: genres.map(function (genre) {
            return getData(years[i], genre);
        })
        })
    }

    var sliderSteps = [];
    for (i = 0; i < years.length; i++) {
        sliderSteps.push({
        method: 'animate',
        label: years[i],
        args: [[years[i]], {
            mode: 'immediate',
            transition: {duration: 300},
            frame: {duration: 300, redraw: false},
        }]
        });
    }
    
    var layout = {
        title: 'Genre Evolution over time',
        xaxis: {
        title: 'Average Duration of songs (in seconds)',
        range: [0, 500]
        },
        yaxis: {
        title: 'Song Hotness (Normalized 0-1)',
        range: [0,1]
        },
        hovermode: 'closest',
        height: 600,
        updatemenus: [{
        x: 0,
        y: 0,
        yanchor: 'top',
        xanchor: 'left',
        showactive: false,
        direction: 'left',
        type: 'buttons',
        pad: {t: 87, r: 10},
        buttons: [{
            method: 'animate',
            args: [null, {
            mode: 'immediate',
            fromcurrent: true,
            transition: {duration: 300},
            frame: {duration: 500, redraw: false}
            }],
            label: 'Play'
        }, {
            method: 'animate',
            args: [[null], {
            mode: 'immediate',
            transition: {duration: 0},
            frame: {duration: 0, redraw: false}
            }],
            label: 'Pause'
        }]
        }],

        sliders: [{
        pad: {l: 130, t: 55},
        currentvalue: {
            visible: true,
            prefix: 'Year:',
            xanchor: 'right',
            font: {size: 20, color: '#666'}
        },
        steps: sliderSteps
        }]
    };


    Plotly.plot('myDiv', {
        data: traces,
        layout: layout,
    config: {showSendToCloud:true},
        frames: frames,
    });
    });


    fetch('data/songs_details.csv')
    .then(response => response.text())
    .then(data => {
      // Process the CSV data
      processData1(data);
    });


        //======================================================================================


    // Process the CSV data
    function processData1(csvData) {
        // Split the CSV data into rows
        var rows = csvData.split('\n');

        // Extract headers from the first row
        var headers = rows[0].split(',');

        // Initialize arrays to store data
        var data = [];
        var genreSet = new Set();

        // Iterate through rows starting from the second row (index 1)
        for (var i = 1; i < rows.length; i++) {
          var values = rows[i].split(',');
 
          var genre = values[0];  
          var year = parseInt(values[13]); 

          if (genre !== undefined) {
            data.push({genre, year });
            genreSet.add(genre);
          }
        }
        

        var uniqueGenres = Array.from(genreSet);
        console.log(uniqueGenres);
        
        var colorScale = d3.scaleOrdinal()
          .domain(uniqueGenres) 
          .range(d3.schemeCategory10); 
        var traces = [];

        var uniqueYears = Array.from(new Set(data.map(row => row.year))); 
        
        uniqueYears.forEach(year => {
          var filteredData = data.filter(row => row.year === year);

          var sortedGenres = uniqueGenres.slice().sort((a, b) => {
            var songsA = filteredData.filter(row => row.genre === a).length;
            var songsB = filteredData.filter(row => row.genre === b).length;
            return songsB - songsA;
          });

          var yearTraces = sortedGenres.map(genre => {
            var genreData = filteredData.filter(row => row.genre === genre);
            genreData.sort((a, b) => b.numberOfSongs - a.numberOfSongs);

            return {
              x: [year],
              y: [genreData.length],
              type: 'bar',
              name: genre,
              marker: {
                color: colorScale(genre),
              },
            };
          });
          
          traces.push(...yearTraces);
        });

        var layout = {
          barmode: 'stack',
          title: 'Genre distribution through the years',
          xaxis: {
            title: 'Year',
            tickvals: uniqueYears, 
            tickmode: 'array',
          },
          yaxis: { title: 'Number of songs' },
          showlegend: true,
          legend: {
            x: 1,
            y: 1,
            font: {
              family: 'Arial, sans-serif',
              size: 16,
              color: 'grey',
            },
          },
        };

    Plotly.newPlot('stackedbar', traces, layout);
    }


    //======================================================================================

    function processData2(csvData, selectedArtist) {
      const rows = csvData.split('\n');
      const hotnessByYear = {};

      for (let i = 1; i < rows.length; i++) {
        const values = rows[i].split(',');
        const artist = values[2];
        const hotness = parseFloat(values[4]);
        const year = parseInt(values[13]);

        if (artist === selectedArtist && !isNaN(hotness) && !isNaN(year)) {
          if (!hotnessByYear[year]) {
            hotnessByYear[year] = [];
          }
          hotnessByYear[year].push(hotness);
        }
      }

      const averageHotnessByYear = Object.keys(hotnessByYear).map(year => {
        const hotnessValues = hotnessByYear[year];
        const averageHotness = hotnessValues.reduce((sum, val) => sum + val, 0) / hotnessValues.length;
        return { year: parseInt(year), averageHotness };
      });

      return averageHotnessByYear;
    }

      fetch('data/songs_details.csv')

        .then(response => response.text())
        .then(csvData => {
          const artists = new Set();
          const rows = csvData.split('\n');
          for (let i = 1; i < rows.length; i++) {
            const values = rows[i].split(',');
            artists.add(values[2]);
          }

          const artistArray = Array.from(artists);
          const temp = artistArray[0];
          artistArray[0]=artistArray[14];
          artistArray[14]=temp;
          
          const artistDropdown = document.getElementById('artistDropdown');
          artistArray.forEach(artist => {
            const option = document.createElement('option');
            option.value = artist;
            option.text = artist;
            artistDropdown.appendChild(option);
          });

          artistDropdown.addEventListener('change', function () {
            const selectedArtist = this.value;
            const processedData = processData2(csvData, selectedArtist);

            const allYears=processedData.map(item=>item.year);
            const trace = {
              x: processedData.map(item => item.year),
              y: processedData.map(item => item.averageHotness),
              mode: 'lines+markers',
              type: 'scatter',
              name: selectedArtist,
            };

            const layout = {
              title: `Average Artist Hotness for ${selectedArtist}`,
              xaxis: { 
              title: 'Year',
              tickvals: allYears,
              tickmode: 'array',
              tickformat: 'd',
              },
              yaxis: { title: 'Average Hotness', range: [0.0,1.0]  },

            };

            const data = [trace];
            Plotly.newPlot('linechart', data, layout);
          });

          const firstArtist = artistDropdown.options[0].value;
          const initialData = processData2(csvData, firstArtist);

          const trace = {
            x: initialData.map(item => item.year),
            y: initialData.map(item => item.averageHotness),
            mode: 'lines+markers',
            type: 'scatter',
            name: firstArtist,
          };

          const layout = {

            title: `Average Artist Hotness for ${firstArtist}`,
            xaxis: {
            title: 'Year',
            tickformat: 'd'},
            yaxis: { title: 'Average Hotness', range: [0.0,1.0] }

          };

          const data = [trace];
          Plotly.newPlot('linechart', data, layout);
        });