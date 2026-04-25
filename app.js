document.addEventListener('DOMContentLoaded', () => {
    // Correctly calculate VH for mobile browsers (fixes address bar issue)
    const setVH = () => {
        let vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
    setVH();
    window.addEventListener('resize', setVH);

    // --- Google Maps Initialization ---
    // Precise GH Raisoni Jalgaon center
    const campusCenter = { lat: 20.962134, lng: 75.553502 };
    
    // Custom map styling (only applies to roadmap)
    const roadmapStyles = [
        { "featureType": "poi", "stylers": [{ "visibility": "off" }] },
        { "featureType": "transit", "stylers": [{ "visibility": "off" }] },
        {
            "featureType": "all",
            "elementType": "geometry.fill",
            "stylers": [{ "weight": "2.00" }]
        },
        {
            "featureType": "all",
            "elementType": "geometry.stroke",
            "stylers": [{ "color": "#9c9c9c" }]
        },
        {
            "featureType": "all",
            "elementType": "labels.text",
            "stylers": [{ "visibility": "on" }]
        }
    ];

    const campusBounds = {
        north: 20.966,
        south: 20.958,
        west: 75.548,
        east: 75.558,
    };

    const map = new google.maps.Map(document.getElementById("map"), {
        center: campusCenter,
        zoom: 18,
        minZoom: 16,
        maxZoom: 21,
        restriction: {
            latLngBounds: campusBounds,
            strictBounds: false, // Allows slight overlap for better feel
        },
        disableDefaultUI: true,
        styles: roadmapStyles
    });

    map.addListener('click', () => {
        collapseSheet();
    });

    // Custom Blue Dot (User Location)
    const blueDotMarker = new google.maps.Marker({
        position: campusCenter,
        map: map,
        icon: {
            path: google.maps.SymbolPath.CIRCLE,
            fillColor: '#3B82F6',
            fillOpacity: 1,
            strokeColor: '#FFFFFF',
            strokeWeight: 2,
            scale: 8
        },
        clickable: false
    });

    // --- Render Campus Markers ---
    const buildingMarkers = [];

    if (typeof campusBuildings !== 'undefined') {
        campusBuildings.forEach(building => {
            const position = { lat: building.center[0], lng: building.center[1] };

            // Custom marker with label
            const marker = new google.maps.Marker({
                position: position,
                map: map,
                title: building.name,
                icon: {
                    path: google.maps.SymbolPath.CIRCLE,
                    fillColor: '#f33b3b',
                    fillOpacity: 0.9,
                    strokeColor: '#FFFFFF',
                    strokeWeight: 2,
                    scale: 10
                },
                label: {
                    text: building.name,
                    color: '#0F172A',
                    fontSize: '11px',
                    fontWeight: '600',
                    fontFamily: 'Outfit, sans-serif',
                    className: 'marker-label'
                }
            });

            // Click interaction
            marker.addListener('click', () => {
                window.openPhotoViewer(building.id);
                expandSheet();
                if (activeInput === 'source') {
                    stopTracking();
                    sourceInput.value = building.name;
                    selectedSource = building;
                    const pos = { lat: building.center[0], lng: building.center[1] };
                    blueDotMarker.setPosition(pos);
                } else {
                    destInput.value = building.name;
                    selectedTarget = building;
                }
            });

            buildingMarkers.push({ id: building.id, category: building.category, marker: marker });
        });
    }

    // --- Directions Service ---
    const directionsService = new google.maps.DirectionsService();
    const directionsRenderer = new google.maps.DirectionsRenderer({
        map: map,
        suppressMarkers: true,
        polylineOptions: {
            strokeColor: '#f33b3b',
            strokeOpacity: 0.8,
            strokeWeight: 6
        }
    });

    // Elements
    const routingSheet = document.getElementById('routingSheet');
    const sourceInput = document.getElementById('sourceInput');
    const destInput = document.getElementById('destInput');
    const closeSheetBtn = document.getElementById('closeSheetBtn');
    const swapBtn = document.querySelector('.swap-btn');
    const openNavFab = document.getElementById('openNavFab');
    const locateMeBtn = document.getElementById('locateMeBtn');
    const mapToggleBtn = document.getElementById('mapToggleBtn');
    const instructionCard = document.getElementById('instructionCard');
    const navInstruction = document.getElementById('navInstruction');
    const navMeta = document.getElementById('navMeta');

    // UI State
    let isSheetExpanded = false;
    let activeInput = 'dest';
    let selectedSource = campusBuildings[0]; 
    let selectedTarget = null;
    let isTracking = false;
    let isNavigating = false;
    let watchId = null;

    // Expand bottom sheet
    const expandSheet = () => {
        if (!isSheetExpanded) {
            routingSheet.classList.add('expanded');
            openNavFab.style.opacity = '0';
            openNavFab.style.pointerEvents = 'none';
            isSheetExpanded = true;
        }
    };

    // Collapse bottom sheet
    const collapseSheet = () => {
        if (isSheetExpanded) {
            routingSheet.classList.remove('expanded');
            setTimeout(() => {
                openNavFab.style.opacity = '1';
                openNavFab.style.pointerEvents = 'auto';
            }, 350);
            isSheetExpanded = false;
            destInput.blur();
            sourceInput.blur();
        }
    };

    // Event Listeners
    sourceInput.addEventListener('focus', () => { expandSheet(); activeInput = 'source'; });
    destInput.addEventListener('focus', () => { expandSheet(); activeInput = 'dest'; });

    // Satellite Toggle
    let isSatellite = false;
    mapToggleBtn.addEventListener('click', () => {
        isSatellite = !isSatellite;
        if (isSatellite) {
            map.setOptions({ styles: [] });          // Clear custom styles
            map.setMapTypeId('hybrid');               // Switch to satellite
        } else {
            map.setMapTypeId('roadmap');              // Switch to roadmap
            map.setOptions({ styles: roadmapStyles }); // Reapply custom styles
        }
        mapToggleBtn.classList.toggle('active', isSatellite);
        mapToggleBtn.querySelector('span').innerText = isSatellite ? 'map' : 'satellite_alt';
    });
    
    openNavFab.addEventListener('click', (e) => {
        e.stopPropagation();
        if (isNavigating) cancelNavigation();
        else { expandSheet(); }
    });

    closeSheetBtn.addEventListener('click', (e) => { e.stopPropagation(); collapseSheet(); });
    document.querySelector('.map-container').addEventListener('click', collapseSheet);

    // Swap Logic
    swapBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const tempVal = sourceInput.value;
        const tempB = selectedSource;
        sourceInput.value = destInput.value;
        selectedSource = selectedTarget;
        destInput.value = tempVal;
        selectedTarget = tempB;
        if(selectedSource) {
            const center = { lat: selectedSource.center[0], lng: selectedSource.center[1] };
            blueDotMarker.setPosition(center);
        }
    });


    // Populate List
    const dynamicLocationList = document.getElementById('dynamicLocationList');
    if(dynamicLocationList) {
        campusBuildings.forEach(building => {
            const li = document.createElement('li');
            li.className = 'location-item';
            li.innerHTML = `
                <div class="icon-box"><span class="material-icons-round">place</span></div>
                <div class="location-details">
                    <span class="loc-name">${building.name}</span>
                    <span class="loc-desc">${building.description}</span>
                </div>
            `;
            li.addEventListener('click', () => {
                if (activeInput === 'source') {
                    stopTracking();
                    sourceInput.value = building.name;
                    selectedSource = building;
                    const center = { lat: building.center[0], lng: building.center[1] };
                    blueDotMarker.setPosition(center);
                } else {
                    destInput.value = building.name;
                    selectedTarget = building;
                }
            });
            dynamicLocationList.appendChild(li);
        });
    }

    // Geolocation
    const startTracking = () => {
        if (!navigator.geolocation) return;
        isTracking = true;
        locateMeBtn.classList.add('tracking');
        sourceInput.value = "Current Location (Live)";
        watchId = navigator.geolocation.watchPosition((pos) => {
            const userPos = { lat: pos.coords.latitude, lng: pos.coords.longitude };
            selectedSource = { name: "Current Location", center: [pos.coords.latitude, pos.coords.longitude] };
            blueDotMarker.setPosition(userPos);
            if (isNavigating) calculateRoute(); // update live
        }, null, { enableHighAccuracy: true });
    };

    const stopTracking = () => {
        isTracking = false;
        if (watchId) navigator.geolocation.clearWatch(watchId);
        locateMeBtn.classList.remove('tracking');
    };

    locateMeBtn.addEventListener('click', () => {
        if (isTracking) stopTracking(); else startTracking();
    });

    // Navigation Toggle Logic
    const startNavBtn = document.getElementById('startNavBtn');

    const cancelNavigation = () => {
        directionsRenderer.setDirections({ routes: [] });
        isNavigating = false;
        instructionCard.classList.remove('visible');
        openNavFab.querySelector('span').innerText = 'directions';
        startNavBtn.innerHTML = '<span class="material-icons-round">navigation</span> Start Navigation';
        startNavBtn.style.backgroundColor = 'var(--primary)';
    };

    const calculateRoute = () => {
        if (!selectedSource || !selectedTarget) return;
        
        const request = {
            origin: { lat: selectedSource.center[0], lng: selectedSource.center[1] },
            destination: { lat: selectedTarget.center[0], lng: selectedTarget.center[1] },
            travelMode: 'WALKING'
        };

        directionsService.route(request, (result, status) => {
            if (status == 'OK') {
                directionsRenderer.setDirections(result);
                const leg = result.routes[0].legs[0];
                navInstruction.innerText = leg.steps[0].instructions.replace(/<[^>]*>?/gm, ''); // Strip HTML tags
                navMeta.innerText = `${leg.distance.text} • ${leg.duration.text}`;
                instructionCard.classList.add('visible');
                isNavigating = true;
                openNavFab.querySelector('span').innerText = 'close';
                startNavBtn.innerHTML = '<span class="material-icons-round">close</span> Cancel Navigation';
                startNavBtn.style.backgroundColor = '#64748B';
            }
        });
    };

    startNavBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (isNavigating) { cancelNavigation(); collapseSheet(); }
        else { calculateRoute(); collapseSheet(); }
    });

    // --- Photo Viewer Logic ---
    const photoOverlay = document.getElementById('photoOverlay');
    const closePhotoBtn = document.getElementById('closePhotoBtn');
    const targetPhoto = document.getElementById('targetPhoto');
    const photoTitle = document.getElementById('photoTitle');
    const photoDesc = document.getElementById('photoDesc');

    window.openPhotoViewer = (buildingId) => {
        const building = campusBuildings.find(b => b.id === buildingId);
        if (building) {
            targetPhoto.src = building.image;
            photoTitle.innerText = building.name;
            photoDesc.innerText = building.description;
            photoOverlay.classList.add('active');
        }
    };

    closePhotoBtn.addEventListener('click', () => {
        photoOverlay.classList.remove('active');
    });

    photoOverlay.addEventListener('click', (e) => {
        if (e.target === photoOverlay) {
            photoOverlay.classList.remove('active');
        }
    });

    // --- Campus Timings Logic ---
    const timingsBtn = document.getElementById('timingsBtn');
    const timingsPanel = document.getElementById('timingsPanel');
    const closeTimingsBtn = document.getElementById('closeTimingsBtn');
    const timingsList = document.getElementById('timingsList');

    if (timingsList && typeof campusTimings !== 'undefined') {
        campusTimings.forEach(item => {
            const div = document.createElement('div');
            div.className = 'timings-item';
            div.innerHTML = `
                <span class="material-icons-round">${item.icon}</span>
                <div class="timings-info">
                    <span class="name">${item.name}</span>
                    <span class="time">${item.time}</span>
                </div>
            `;
            timingsList.appendChild(div);
        });
    }

    timingsBtn.addEventListener('click', () => {
        timingsPanel.classList.toggle('active');
    });

    closeTimingsBtn.addEventListener('click', () => {
        timingsPanel.classList.remove('active');
    });

    // --- Compass Logic ---
    const compassArrows = document.getElementById('compassArrows');
    
    const updateCompass = () => {
        const heading = map.getHeading() || 0;
        // Point North by adjusting based on map heading
        if (compassArrows) {
            compassArrows.style.transform = `rotate(${45 - heading}deg)`;
        }
    };


    map.addListener('heading_changed', updateCompass);

    map.addListener('tilt_changed', updateCompass);
    
    // Initial update
    updateCompass();
});
