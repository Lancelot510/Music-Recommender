var song_similarity_csv = 'data/song_similarity_recommendations_500k.csv';
var user_recommendations_csv = 'data/user_song_recommendations_500k.csv';
var nodes_csv = 'data/songs_details.csv';
var user_top_played_csv='data/user_top_played_songs.csv';

// SVG Dimensions
var width = 1080;
var height = 720;
var margins = {
    left: 50,
    right: 50,
    top: 50,
    bottom: 50
};
var networkGraphWidth = width - margins.left - margins.right;
var networkGraphHeight = height - margins.top - margins.bottom;
var radiusScale = d3.scaleLinear().range([5, 25]);
const colors = {
    'USER': '#E0538F',
    'DEFAULT': '#2E64A2',
    'EXPANDED': '#95D134'
};
var nodes, edges, edges1, edges2, user_topsongs, allUsersMap, allNodesMap, songEdges, newSongEdges;
var sliderValue;
var graphData, graph, selectedSong, graphDataMap, recommendationsDiv;
var recommendations = [];
var expandedSongs = [];
var force;

const slider = document.getElementById("similar_count_slider");

let tip = d3.tip().attr('class', 'd3-tip').attr("id", "tooltip");

const search = document.getElementById("search");

Promise.all([
    d3.dsv(",", song_similarity_csv, function (ssr) {
        return {
            source: ssr.source_song_id,
            target: ssr.target_song_id,
            rank: parseInt(ssr.rank)
        };
    }),
    d3.dsv(",", user_recommendations_csv, function (usr) {
        return {
            source: usr.user_id,
            target: usr.song_id,
            rank: parseInt(usr.rank)
        };
    }),
    d3.dsv(",", nodes_csv, (node) => {
        return {
            song_id: node.song_id,
            song_name: node.title,
            genre: node.genre,
            artist_name: node.artist_name,
            year: parseInt(node.year),
            song_hotness: isNaN(parseFloat(node.song_hotttnesss)) ? 0 : parseFloat(node.song_hotttnesss),
            release_album: node.release,
            label: 0
        };
    }),
    d3.dsv(",", user_top_played_csv, function (utp) {
        return {
            user_id: utp.user_id,
            song_id: utp.song_id,
            song_name: utp.title,
            listen_count: parseInt(utp.listen_count),
            user_name: utp.fake_name,
            label: 1
        };
    })
]).then(allData => {
    edges1 = allData[0];
    edges2 = allData[1]; 
    nodes = allData[2]; 
    user_topsongs=allData[3]; 

    edges = edges1.concat(edges2);

    const uniqueUsers = Array.from(new Set(user_topsongs.map(item => JSON.stringify({ user_id: item.user_id, user_name: item.user_name, label: item.label })))).map(JSON.parse);

    const users_array = uniqueUsers.map(item => {
        const newItem = { ...item, id: item.user_id };
        delete newItem.user_id;
        return newItem;
      });

    allUsersMap = uniqueUsers.reduce((obj, item, idx) => {
        item['index'] = idx;
        item.children = null;
        obj[item['user_id']] = item;
        return obj;
    }, {}); 


    allNodesMap = nodes.reduce((obj, item, idx) => {
        item['index'] = idx;
        item.children = null;
        obj[item['song_id']] = item;
        return obj;
    }, {}); 

    radiusScale.domain([5, 25]);

    var svg = d3.select("body").append("svg")
        .attr("width", width)
        .attr("height", height);

    graph = svg.append("g")
        .attr("width", networkGraphWidth)
        .attr("height", networkGraphHeight)
        .attr("transform", "translate( " + margins.left + ", " + margins.top + ")");

    recommendationsDiv = d3.select("body")
        .append("div")
        .attr("id", "recommendations-div")

    selectedSong = uniqueUsers[0];
    sliderValue = 5;

    displayTopSongs(selectedSong.user_id)
    fetchGraphData(selectedSong);
    graphDataMap = buildGraphDataMap({});
    drawGraph();

    var selectTag = d3.select("select");

    var options = selectTag.selectAll('#select_user')
        .data(uniqueUsers);

    options.enter()
        .append('option')
        .attr('value', function (d) {
            return d.user_id;
        })
        .attr('id', function (d) {
            return d.user_id;
        })
        .text(function (d) {
            return d.user_name
        });
    
    document.getElementById("search").addEventListener("click", function () {
        var e = document.getElementById("user");
        var text = e.options[e.selectedIndex].id;
        selectedSong = allUsersMap[text];
        recommendations = [];
        displayTopSongs(text)
        clearGraph();
        fetchGraphData(selectedSong);
        graphDataMap = buildGraphDataMap({});
        drawGraph();

        ;
    });


    
    
    
    document.getElementById("similar_count_slider").addEventListener("input", function () {
        sliderValue = this.value;
        document.getElementById("slider-value").innerText = sliderValue; 
        recommendations = [];
        clearGraph();
        fetchGraphData(selectedSong);
        graphDataMap = buildGraphDataMap({});
        drawGraph();
    });


    tip.html(function (d) {
        return getTooltipStats(d);
    });
    graph.call(tip);


}).catch(error => {
    console.log(error)
});

/**
 * @param currentMap
 */
function buildGraphDataMap(currentMap) {
    graphData.forEach(node => {
        currentMap[node['song_id']] = node;
    });
    return currentMap;
}


/**
 * @param {*} selectedSong
 */
function fetchGraphData(selectedSong) {
    selectedSong.children = [];
    graphData = [selectedSong];
    if (selectedSong.user_id){
        songEdges = getSongNetwork(selectedSong['user_id'], sliderValue);
        songEdges.forEach(edge => {
            var target = allNodesMap[edge['target']];
            graphData.push(target);
            selectedSong.children.push(target);
            recommendations.push(target);
        });
    }
    else{
        songEdges = getSongNetwork(selectedSong['song_id'], sliderValue);
        songEdges.forEach(edge => {
            var target = allNodesMap[edge['target']];
            graphData.push(target);
            selectedSong.children.push(target);
            recommendations.push(target);
        });
    }
}

/**
 * @param {*} hoveredNode
 * @returns 
 */
function getTooltipStats(hoveredNode) {
    if (hoveredNode.user_id){
        return "User Name: " + hoveredNode['user_name'];
    }
    else{
        return "Song Name: " + hoveredNode['song_name'] + 
        "<br> Artist Name: " + hoveredNode['artist_name'] +
        "<br> Release Album: " + hoveredNode['release_album'] +
        "<br> Genre: " + hoveredNode['genre'] +
        "<br> Year: " + parseInt(hoveredNode['year'])+
        "<br> Song Hotness: " + parseFloat(hoveredNode['song_hotness']).toFixed(2);
    }
    
}

/**
 * @param source_id
 * @param count
 */
function getSongNetwork(source_id, count = 9) {
    let filtered = edges.filter(edge => edge['source'] === source_id);

    let neighbors = JSON.parse(JSON.stringify(filtered))
        .sort((edge1, edge2) => edge1['rank'] - edge2['rank'])
        .slice(0, count);
    return neighbors;
}


function tick() {
    path.attr("d", function (d) {
        var dx = d.target.x - d.source.x,
            dy = d.target.y - d.source.y,
            dr = Math.sqrt(dx * dx + dy * dy);
        var test = "M" +
            d.source.x + "," +
            d.source.y + "A" +
            dr + "," + dr + " 0 0,1 " +
            d.target.x + "," +
            d.target.y;
        return test;
    });

    node.attr("transform", function (d) {
        // Constrain x and y coordinates within the bounds
        d.x = Math.max(radiusScale.range()[0]+10, Math.min(networkGraphWidth - radiusScale.range()[0], d.x));
        d.y = Math.max(radiusScale.range()[0]+10, Math.min(networkGraphHeight - radiusScale.range()[0], d.y));
        return "translate(" + d.x + "," + d.y + ")";
    });
}


/**
 * @param graph
 */
function clearGraph() {
    graph.selectAll("*").remove();
}


function drawGraph() {

    var topLinkColor = "yellow";
    var topCircleColor = "orange";


    if (force != null)
        force.stop();
    force = d3.forceSimulation()
        .nodes(d3.values(graphDataMap))
        .force("link", d3.forceLink(songEdges).id((d) => {
            if (d.user_id) {
                return d['user_id'];
            }
            else{
                return d['song_id'];
            }
            }).distance(150).strength(0.1))
        .force('center', d3.forceCenter(networkGraphWidth / 2, networkGraphHeight / 2))
        .force("x", d3.forceX())
        .force("y", d3.forceY())
        .force("charge", d3.forceManyBody().strength(-400))
        .alphaTarget(0.1)
        .on("tick", tick);

    var nodes = force.nodes();
    var topNodes = nodes.sort((a, b) => b.song_hotnesss - a.song_hotnesss).slice(0, 5);

    path = graph.append("g")
        .selectAll("path")
        .data(songEdges)
        .enter()
        .append("path")
        .attr("class", (d) => {
            if (topNodes.includes(d.source) && topNodes.includes(d.target)) {
                return "default-link";
            } else {
                return "default-link";
            }
        })

        .attr("fill", (d) => {
            if (topNodes.includes(d.source) && topNodes.includes(d.target)) {
                return "none";
            } else {
                return "none";
            }
        })
        .attr("stroke", (d) => {
            if (topNodes.includes(d.source) && topNodes.includes(d.target)) {
                return "#666";
            } else {
                return "#666";
            }
        });

    node = graph.selectAll(".node")
        .data(force.nodes())
        .enter().append("g")
        .attr("class", "node")
        .call(d3.drag()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended))
        .on("dblclick", update)
        .on("click",function(d){
            d.fixed=false;
            d.fx=null;
            d.fy=null;
            //svg.selectAll("circle").style("fill", function(d){return colorScale(d.weight)})
          })
        .on('mouseover', tip.show)
        .on('mouseout', tip.hide);


    node.append("circle")
        .attr("id", function (d) {
            return d.id;
        })
 
        .attr("r", 8)
        .attr("fill", (d) => {
            if (d['user_id'] == selectedSong['user_id']) {
                return colors.USER;
            } else if (d['children'] != null) {
                return colors.EXPANDED;
            } else {
                return colors.DEFAULT;
            }
        });



    node.append("text")
        .attr("stroke", "black")
        .attr("font-size", "12px")
        .attr("x", 10)
        .attr("y", -5)
        .text(function (d) {
            if (d.user_id){
                return (d.user_name);
            }
            else{
                return (d.song_name);
            }
            
        });

    force.alpha(0.1).restart()
}


/**
 * @param d
 */
function update(d) {
    tip.hide;
    if (d.children != null) {
        var idx = expandedSongs.indexOf(d);
        if (idx !== -1) {
            expandedSongs.splice(idx, 1);
        }
        d.children.forEach(child => {
            var index = recommendations.indexOf(child);
            if (index !== -1) {
                recommendations.splice(index, 1);
            }
        });
        let childrenToDelete = d.children.map(child => child['song_id']);
        songEdges = songEdges.filter(edge => {
            return !(edge['source']['song_id'] == d['song_id'] && childrenToDelete.includes(edge['target']['song_id']))
        });
        var edgeTargets = songEdges.map(edge => edge['target']['song_id']);
        graphData = graphData.filter(node => {
            let key = node['song_id'];
            return edgeTargets.includes(key) || key == selectedSong['song_id']
        });
        graphDataMap = buildGraphDataMap({});
        d.children = null;
        clearGraph();
        drawGraph();

    } else {

        expandedSongs.push(d);

        if (d.user_id){
            newSongEdges = getSongNetwork(d['user_id'], sliderValue);
        }
        else{
            newSongEdges = getSongNetwork(d['song_id'], sliderValue);
        }
        
        d.children = [];
        newSongEdges.forEach(edge => {
            var target = allNodesMap[edge['target']];
            if (graphData.filter(node => node['song_id'] === target['song_id']).length == 0) {
                graphData.push(target);
            }
            d.children.push(target);
            recommendations.push(target);
        });
        songEdges = songEdges.concat(newSongEdges);
        graphDataMap = buildGraphDataMap(graphDataMap);
        clearGraph();
        drawGraph();
    }
}


function displayTopSongs(selectedUser) {
    var userTopSongs = user_topsongs.filter(function (song) {
        return song.user_id === selectedUser;
    });

    userTopSongs.sort(function (a, b) {
        return b.listen_count - a.listen_count;
    });

    var topSongsList = document.getElementById("topSongsList"); 
    topSongsList.innerHTML = ""; 

    userTopSongs.forEach(function (song) {
        var listItem = document.createElement("li");
        listItem.textContent = song.song_name + " : Played " + song.listen_count + " times";
        topSongsList.appendChild(listItem);
    });

    topSongsList.style.textAlign = "center";
}

function dragstarted(d) {
    if (!d3.event.active) force.alphaTarget(0.1).restart();
    d.fx = d.x;
    d.fy = d.y;
    
};

function dragged(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
    d.fixed=true;
};

function dragended(d) {
    if (!d3.event.active) force.alphaTarget(0);
    if (d.fixed == true) {
      graph.selectAll("circle")
              .filter(function(c){
                  return c.name == d.name;
              })
        d.fx = d.x;
        d.fy = d.y;
    }
    else {
        d.fx = null;
        d.fy = null;
    }
};

