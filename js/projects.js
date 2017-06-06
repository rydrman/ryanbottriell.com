var projects = {};
var tags = {};
var filters = [];

function parseProjects(json)
{
    
    for(var i in json)
    {
        var proj = new ContentBlock(json[i]);
        projects[ proj.id ] = proj;
    }
    
    //get all the tags from the projects for filtering
    var tag;
    for(var i in projects)
    {
        for(var t in projects[i].tags)
        {
            tag = projects[i].tags[t];
            
            if('undefined' == typeof(tags[tag]))
            {
                tags[tag] = 1;
            }
            else
            {
                tags[tag]++;
            }
        }
    }
    
    if(hash.p == 'projects')
    {
        populateFilters();
        populateProjects();
    }
    else if( hash.p[0] == "{" )
    {
        showProject( hash.p.slice(1, hash.p.length - 1) );
    }
}

function populateFilters()
{
    var wrapper = $("#filter-wrapper");
    wrapper.html("Filters");
    
    var names = [];
    
    for(var i in tags)
    {
        names.push(i);
    }
    
    names.sort();
    
    for(var n in names)
    {
        i = names[n];
        var div = $(document.createElement('div'));
        div.addClass('filter-item');
        var checkbox = $(document.createElement('div'));
        checkbox.addClass('filter-checkbox');
        checkbox.addClass('outline');
        var count = $(document.createElement('div'));
        count.addClass('filter-count');
        count.html(tags[i]);
        div.append(checkbox[0]);
        div.append( i );
        div.append( count[0] );
        wrapper.append( div[0] );
        div.click(i, filterClick);
    }
    
    wrapper.append("<div id='filter-message'>Much of my work experience is under NDA, and is not listed here.</div>");
}

function populateProjects()
{
    var wrapper = $("#projects-wrapper");
    
    wrapper.html("");
    
    $("body")[0].scrollTop = 0;
    
    var filtered = [];
    
    for(var i in projects)
    {
        var okay = true;
        for(var t in filters)
        {
            if(filters.length == 0 || projects[i].tags.indexOf( filters[t] ) == -1)
            {
                okay = false;
                break;
            }
        }
        if(okay)
        {
            filtered.push( projects[i] );
        }
    }

    
    for(var i = 0; i < filtered.length; ++i)
    {
        wrapper.append( filtered[i].DOM )
        filtered[i].build();
        filtered[i].jDOM.hide().show();
        filtered[i].jDOM.css("opacity", 1);
        filtered[i].jDOM.css("top", "0px");
        filtered[i].jDOM.css("transition-delay", (i+1) + "00ms, " + (i+1) + "00ms, 0ms");
        filtered[i].jDOM.click(filtered[i], function(e){loadProject(e.data)})
    }
}

function filterClick( e )
{
    
    var i = filters.indexOf( e.data );
    
    $(".filled").removeClass("filled");
    
    if( i == -1 )
    {
        filters = [e.data];
        $($(e.currentTarget).children()[0]).addClass("filled");
    }
    else
    {
        filters = [];
        $($(e.currentTarget).children()[0]).removeClass("filled");
    }
    
    $("#projects-wrapper").children().css("opacity", 0).css("top", "-5px");
    
    setTimeout( populateProjects, 1000 );
    
}

function loadProject( block )
{
    if(block.contentDOM == null)
    {
        block.contentDOM = document.createElement('div');
        block.jContentDOM = $(block.contentDOM);
        block.jContentDOM.addClass("content-frame");
                
        $.get(block.base + block.contentFile, function(content){
            content = content.split( "{$base}" ).join( block.base );
            block.jContentDOM.html(content);
            block.jContentDOM.children().addClass('animated');
            if(hash.p == "{" + block.id + "}")
                showProject( block.id );
        });
    }
    
    changePage("{" + block.id + "}");
}

function showProject( id )
{
    //wait till it's ready
    if('undefined' == typeof(projects[ id ]))
    {
        if(projects.length > 0)
        {
            //project not found, go back to list
            changePage('projects')
        }
        return;
    }
    
    if(projects[id].jContentDOM == null)
    {
        loadProject(projects[id]);
        return;
    }
    
    $("#content").html("<div id='header-spacer'></div>");
    $("#content").append(projects[id].jContentDOM);
    $("#content").hide().show();
    
    var divs = projects[id].jContentDOM.children();
    for(var i = 0; i < divs.length; ++i)
    {
        $(divs[i]).hide().show().css("transition-delay", (i+1) + "00ms, " + (i+1) + "00ms, 0ms");
        $(divs[i]).css("top", "0px").css("opacity", 1);
    }
    $("body")[0].scrollTop = 0;
    
}

function showImage(url)
{
    window.open(url, '_blank');
}

/////////////////////////
////  CONTENT BLOCK  ////
/////////////////////////

var ContentBlock = function( json )
{
    if('undefined' == typeof(json)) json = {};
    
    this.id = json.title;
    this.title = json.niceTitle ? json.niceTitle : json.title ? json.title : "Title";
    this.color = json.color ? json.color : "#444";
    this.desc = json.description ? json.description : "";
    this.base = json.base;
    this.contentFile = json.contentFile;
    this.tags = json.tags ? json.tags : [];
    this.path = json.base.split("/");
    for(var i = this.path.length-1; i >= 0; --i)
    {
        if(this.path[i] == "")
        {
            this.path.splice(i, 1);   
        }
    }
    
    this.DOM = document.createElement('div');
    this.wrapDOM = document.createElement('div');
    this.titleDOM = document.createElement('div');
    this.descDOM = document.createElement('div');
    this.jDOM = $(this.DOM);
    this.jTitleDOM = $(this.titleDOM);
    this.jWrapDOM = $(this.wrapDOM);
    this.jDescDOM = $(this.descDOM);
    this.contentDOM = null;
    this.jContentDOM = null;
    
    this.jTitleDOM.addClass("block-title");
    this.jDescDOM.addClass("block-description");
    this.jDOM.addClass("content-block");
    this.jDOM.addClass("outline");
    this.jWrapDOM.addClass("block-content");
    var src = (json.image != null) ? json.base + json.image : "content/images/default.png";
    this.img = new Image();
    this.img.src = src;
    $(this.img).addClass("block-image");
    
    this.build();
     
}

ContentBlock.prototype.build = function()
{
    this.jTitleDOM.html(this.title);
    this.jDescDOM.html(this.desc);
    this.jDOM.append(this.img);
    this.jDOM.append(this.jWrapDOM);
    this.jWrapDOM.append(this.jTitleDOM);
    this.jWrapDOM.append(this.jDescDOM);
}

ContentBlock.prototype.setListeners = function()
{
    //events
    var self = this;
    this.jDOM.hover(function(){ContentBlock.hoverIn(self)}, function(){ContentBlock.hoverOut(self)});
    this.jDOM.click(function(){hash.page = self.base; setHash();});
    
    ContentBlock.hoverOut(this);
}

ContentBlock.hoverIn = function( block )
{
    block.textHeight = block.jTitleDOM.height();
    block.jTitleDOM.css("height", block.textHeight + "px");
    block.jTitleDOM.html( block.title + "<p>" + block.desc + "</p>" );
    TweenLite.to( block.jTitleDOM, 0.3, { css:{height: "180px", 'background-color': "rgba(0, 0, 0, 0.85)"}, ease:Linear.EaseOut } );
}

ContentBlock.hoverOut = function( block )
{
    TweenLite.to( block.jTitleDOM, 0.3, { 
        css:{height: block.textHeight + "px", 'background-color': "rgba(0, 0, 0, 0.5)"}, 
        ease:Linear.EaseOut, 
        onComplete: function(){
            block.jTitleDOM.html( block.title );
            block.jTitleDOM.css("height" , "auto");
        } 
    } );
}
