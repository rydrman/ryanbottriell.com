var hash = {
    p: 'main'
}

function onLoad()
{

    if(window.location.hash != "")
        getHash();
    else
        setHash();

    onHashChange();
    $(window).on('hashchange', onHashChange);

    //set button hooks
    $("#logo").click( function(){ changePage('main') } );
    $("#projects-button").click( function(){ changePage('projects') } );
    $("#contact-button").click( function(){ changePage('contact') } );

    //load projects now
    $.getJSON("php/getProjects.php", function(json){self.parseProjects(json)});

    onScroll();
    onResize();
}

function onScroll()
{

}

function onResize()
{

}

function changePage( page )
{
    if(hash.p == page) return;

    switch( hash.p )
    {
        case 'main':
            $("#project-button, #title-block").css( "top", "-10px" ).css("opacity", 0);
            break;
        case 'projects':
            filters = [];
            $("#projects-wrapper").children().css("opacity", 0).css("top", "-5px");
            break;
        default:
            if(hash.p[0] == "{")
            {
                $($("#content").children()[1]).children().css("opacity", 0).css("top", "-5px");
            }
            break;

    }

    setTimeout(function(){
        hash.p = page;
        setHash();
    }, 500);
}

function onHashChange()
{
    getHash();

    //load logic
    switch(hash.p)
    {
        case 'main':
            $("#content").html([
                "<div class='center-floater full-height'>",
                    "<div class='center-wrapper'>",
                        "<div id='title-block' class='outline'>",
                            "<img id='img-me' src='content/images/me.png'/>",
                            "<div id='text-floater'>",
                                "<div id='main-greeting'>Hello.</div>",
                                "<div id='main-purpose'>I am a problem solver, and I love to solve problems with code.</div>",
                                "<div class='contact-wrapper'>",
                                    "<a href='mailto:ryanbottriell@live.ca' target='_black'><div id='contact-email' class='contact-link'></div></a>",
                                    "<a href='http://ca.linkedin.com/in/ryanbottriell' target='_black'><div id='contact-linkedin' class='contact-link'></div></a>",
                                "</div>",
                            "</div>",
                        "</div>",
                        "<div id='project-button' class='outline button'>Projects</div>",
                    "</div>",
                "</div>"].join("") );
            $("#project-button, #title-block").hide().show();
            $("#project-button, #title-block").css( "top", "0px" ).css("opacity", 1);
            $("#project-button").click( function(){ changePage('projects') } );
            $("#contact-email").click( function(){ window.location = "mailto:ryanbottriell@live.ca" } );
            break;

        case 'projects':
            $("#content").html([
                "<div id='header-spacer'></div>",
                    "<div id='filter-wrapper'></div>",
                    "<div id='projects-wrapper'></div>",
                "</div>"].join("") );
            populateFilters();
            populateProjects();
            break;

        case 'contact':
            $("#content").html( [
                "<div class='center-floater full-height'>",
                    "<div class='center-wrapper'>",
                        "<div id='title-block' class='outline'>",
                            "<div id='text-floater' style='width:calc(100% - 60px);text-align: center'>",
                                "<div id='main-greeting'>Contact Me</div>",
                                "<div id='main-purpose'>For the quickest response time, please reach out via <a href='mailto:ryanbottriell@live.ca'>email<a>.</div>",
                                "<div class='contact-wrapper'>",
                                    "<a href='mailto:ryanbottriell@live.ca' target='_black'><div id='contact-email' class='contact-link'></div></a>",
                                    "<a href='http://ca.linkedin.com/in/ryanbottriell' target='_black'><div id='contact-linkedin' class='contact-link'></div></a>",
                                    "<a href='https://github.com/rydrman/' target='_black'><div id='contact-github' class='contact-link'></div></a>",
                                "</div>",
                            "</div>",
                        "</div>",
                        "<div id='project-button' class='outline button'>Projects</div>",
                    "</div>",
                "</div>"].join("") );
            $("#project-button, #title-block").hide().show();
            $("#project-button, #title-block").css( "top", "0px" ).css("opacity", 1);
            $("#project-button").click( function(){ changePage('projects') } );
            break;

        default:
            if(hash.p && hash.p[0] == "{")
            {
                var id = hash.p.slice(1, hash.p.length - 1);
                showProject( id );
            }
            else
            {
                hash.p = 'main';
                setHash();
            }
            break;
    }

    onScroll();
}

function getHash()
{
    var item,
        newHash = window.location.hash.replace("#", "").split("&");

    for(var i = 0; i < newHash.length; i++)
    {
        if(newHash[i] == "") continue;

        item = newHash[i].split("=");

        if(item.length != 2)
        {
            debugger;
            window.location.hash = "";
        }

        hash[item[0]] = item[1];
    }
}

function setHash()
{
    var out = "";

    for(var item in hash)
    {
        if(hash[item] == null) continue;

        out += "&" + item;
        out += "=" + hash[item];
    }
    window.location.hash = out.slice(1, out.length);
}