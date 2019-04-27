---
title: "Interactive Map"
date: 2016-01-01
thumbnail: "/img/interactive-map.png"
---

The interactive studio map is an internal tool that I developed for Bardel Entertainment. <!--more-->

This tool provides a simple interface for locating and finding information on other employees. It's main features are in providing search functionality on the studios ActiveDirectory service.

One of the important goal of this project was not to create new information. The only unique data that is owned by this tool is the actually position data of each desk.

The studio map searches through many different contexts of information and can therefore be used to highlight not only people, but studios, floors and workstations. The workstation data is pulled in in real-time from Bardel's physical asset management system, which allows searching to remain lightweight for target users, but also allows the map to satisfy uses within IT support.

Along with displaying information, the studio map employs simple set of editing commands and functionality hidden behind an ActiveDirectory login. This allows support of the map layout to be handled by the proper parties in a relatively efficient manner.

## Screenshots

{{< img "/interactive-map/map.png" >}}
{{< img "/interactive-map/search.png" >}}
{{< img "/interactive-map/autocomplete.png" >}}
{{< img "/interactive-map/lists.png" >}}
{{< img "/interactive-map/workstation.png" >}}

## Editing

{{< img "/interactive-map/login.png" >}}
{{< img "/interactive-map/editing.png" >}}
