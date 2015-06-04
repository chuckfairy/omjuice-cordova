(function() {

var storage = window.localStorage;
var savedJuices;

var targetMeasurement;
var creationDataTable;
var creatorFlavorsDiv;
var currentJuice = {};
var currentFlavors = [];
var saveButton;

//HTML
var nameInput;
var waterInput;
var pgvgRange;
var targetAmountInput;
var currentJuiceHTML;
var savedJuicesTable;
var baseNicotineInput;
var targetNicotineInput;

$(document).ready(function() {

    $('#headerLinks a').click(function (e) {
        e.preventDefault();
        $('#headerLinks a').removeClass("active");
        $(this).addClass("active");
        //$(this).tab('show');
    });

    initCreator();

    getSavedJuices();
    loadInitJuice();
    displaySavedJuices();

});



function initCreator() {

    //Measurments
    targetMeasurement = "ML";

    //Measurements table and flavor HTML
    creationDataTable = $("#creationDataTable").get(0);
    creatorFlavorsDiv = $("#creatorFlavors").get(0);
    targetAmountInput = $("#creatorAppForm input[data='target amount']");
    nameInput = $("#creationNameInput");
    waterInput = $("#creatorAppForm input[data='Water']");
    currentJuiceHTML = $("#creationCalcFlavorName");
    savedJuicesTable = $("#savedJuicesTable");

    baseNicotineInput = $("#creationBaseNicotine");
    targetNicotineInput = $("#creationTargetNicotine");

    //Save juice
    saveButton = $("#creationSaveButton");
    $(saveButton).click( saveCurrentJuice );

    pgvgRange = $('.slider').slider({
        min: 0,
        max: 100,
        value: 70
    });

    //Calculate Init
    $("#creationCalculateBtn").click( function() {
        calculate();
        $("html, body").animate({ scrollTop: $(document).height() }, "slow");
    });

    //add flavor button
    $("#creatorAddFlavor").click( function() { addFlavor(); } );

    //Main creator calculation and UI
    function calculate() {

        currentJuice = {};

        //Name
        currentJuice.name = $(nameInput).val();

        creationDataTable.innerHTML = "";
        creationDataTable.style.display = "none";

        var targetAmount = currentJuice.targetAmount = $(targetAmountInput).val() - 0.0;


        //Flavors
        var flavorsLength = currentFlavors.length;
        var flavorsML = 0.0;

        for( var i = 0; i < flavorsLength; i++ ) {

            var flavor = currentFlavors[i];
            var flavorML = calcMeasure( targetAmount, flavor.percentageInput.value );
            var flavorName = flavor.nameInput.value;

            currentJuice[flavorName] = flavor.percentageInput.value - 0.0;

            flavorsML += flavorML - 0.0;

        }

        //Nicotine
        var nicotineBaseMl = ( baseNicotineInput.val() - 0.0 ) / 100;
        var targetNicotineMl = ( targetNicotineInput.val() - 0.0 ) / 100;
        var nicotineAmount = targetNicotineMl * ( targetAmount / nicotineBaseMl );
        currentJuice.Nicotine = nicotineAmount;

        //Water
        var waterAmount = ( $(waterInput).val() - 0.0 );
        var waterML = calcMeasure( targetAmount, waterAmount );
        currentJuice.Water = waterAmount;

        //Calc VG and PG
        var vgPgAmount = ( targetAmount - ( waterML + flavorsML + nicotineAmount ) ) / targetAmount;

        //Vg to PG
        var vgTo = pgvgRange.val()|0;
        currentJuice.VG = vgTo * vgPgAmount;

        //Pg
        var pgTo = 100 - vgTo;
        currentJuice.PG = pgTo * vgPgAmount;

        //Set measurement row
        creationDataTable.appendChild( measurementRow() );

        //Set UI juice name
        $(currentJuiceHTML).html( currentJuice.name );

        //Create table and show
        jsonToTable( currentJuice );
        creationDataTable.style.display = null;

    }



}

function loadingHTML() {

    return "<h2>Crunching the number</h2>";

}


function createDataRow( fields, th ) {

    var tr = document.createElement("tr");
    //tr.className = "container";
    var td = document.createElement( ( th ) ? "th" : "td" );
    td.className = "col-xs-4";

    var fieldLength = fields.length;
    for( var i = 0; i < fieldLength; i++ ) {

        var field = fields[i];
        var tdClone = td.cloneNode();
        tdClone.innerHTML = field;

        tr.appendChild(tdClone);

    }

    return tr;

}

function measurementRow() {

    return createDataRow( [ "Liquid", targetMeasurement, "Drips" ], true );

}

function jsonToTable( json ) {

    var targetAmount = json.targetAmount;

    for( name in json ) {

        if( /(name|targetAmount)/.test(name) ) { continue; }

        var data = json[name];
        creationDataTable.appendChild(

            createDataRow([
                name,
                calcMeasure( targetAmount, data ),
                calcDrips( data )
            ])

        );

    }

}

// amount * percentage
function calcMeasure( targetAmount, percentage ) {

    return  ( ( targetAmount * ( percentage / 100 ) ) - 0.0 ).toFixed(2) - 0.0 ;

}

//ML to drips
function calcDrips( targetML ) {

    return Math.round( targetML * 20 );

}

//Flavor Addition
function addFlavor( label, percentage ) {

    var flavor = createFlavorRow( label, percentage );
    creatorFlavorsDiv.appendChild( flavor.row );

    flavor.flavorDelete.onclick = function() {

        creatorFlavorsDiv.removeChild( flavor.row );

        var index = currentFlavors.indexOf( flavor );
        currentFlavors.splice( index, 1 );

    }

    currentFlavors.push( flavor );

}

//Create flavor value editor row
function createFlavorRow( label, percentage ) {

    var doc = document;

    var row = doc.createElement("div");
    row.className = "row";

    var labelCol = doc.createElement("p");
    labelCol.className = "col-xs-4";

    var nameInput = doc.createElement("input");
    nameInput.type = "text";
    nameInput.className = "form-control";
    nameInput.value = label || randomString(6);

    var dividerCol = doc.createElement("div");
    dividerCol.className = "col-xs-1";

    var valueCol = doc.createElement("div");
    valueCol.className = "col-xs-6 input-group";

    var percentageInput = doc.createElement("input");
    percentageInput.type = "number";
    percentageInput.className = "form-control";
    percentageInput.value = percentage || 10;

    var percentageLabel = doc.createElement("div");
    percentageLabel.className = "input-group-addon";
    percentageLabel.innerHTML = "%";

    var flavorDelete = doc.createElement("a");
    flavorDelete.className = "input-group-addon delete";
    flavorDelete.innerHTML = "X";

    //label
    labelCol.appendChild(nameInput);

    //Val ML
    valueCol.appendChild(percentageInput);
    valueCol.appendChild(percentageLabel);
    valueCol.appendChild(flavorDelete);

    //Full append
    row.appendChild(labelCol);
    row.appendChild(dividerCol);
    row.appendChild(valueCol);

    return {
        row: row,
        nameInput: nameInput,
        percentageInput: percentageInput,
        flavorDelete: flavorDelete
    };

}

function save() {

    storage.setItem( "juices", JSON.stringify(savedJuices) );

}

//Storage methods
function saveJuice( name, json ) {

    delete savedJuices[name];
    savedJuices[name] = json;
    save();

}

//Save current working juice
function saveCurrentJuice( ) {

    //Save juice
    if( savedJuices[currentJuice.name] ) {
        removeJuice( currentJuice.name );
    }

    saveJuice( currentJuice.name, currentJuice );
    displaySavedJuices();

}

function loadJuice( juiceOpt ) {

    var juice = ( typeof juiceOpt === "object" ) ?
        juiceOpt : savedJuices[juiceOpt];

    if( !juice ) {
        alert( "Juice falied to load " + juiceOpt );
    }

    creationDataTable.innerHTML = "";
    creationDataTable.appendChild( measurementRow() );
    jsonToTable( juice );

    //Set vals
    targetAmountInput.val( juice.targetAmount );
    nameInput.val( juice.name );
    waterInput.val( juice.Water );


    $(currentJuiceHTML).html( juice.name );

    //Grab flavors
    currentFlavors = [];
    creatorFlavorsDiv.innerHTML = "";
    for( var name in juice ) {

        if( !(/(Water|PG|VG|targetAmount|name)/.test(name)) ) {
            addFlavor( name, juice[name] );
        }

    }

}

function loadInitJuice() {

    for( var name in savedJuices ) { return loadJuice( name ); }

}

//Retrieve localStorage savedFlavors
function getSavedJuices() {

    var juices;

    try {
        juices = JSON.parse(storage.getItem("juices"));
    } catch(e) {}


    if( !juices || $.isEmptyObject(juices) ) {

        //Set default
        juices = {

            "New Wave": {
                name: "New Wave",
                targetAmount: 15,
                VG: 45,
                PG: 10,
                Water: 10,

                //Flavors
                Apple: 10,
                Vanilla: 10

            }

        };

        storage.setItem( "juices", JSON.stringify(juices) );

    }

    savedJuices = juices;

}

function removeJuice( name ) {

    delete savedJuices[name];
    save();

}

function displaySavedJuices() {

    $(savedJuicesTable).html("<tr><th>Name</th><th>Flavors</th><th>Remove</th></tr>");

    var tr = document.createElement("tr");

    for( var name in savedJuices ) {

        var trClone = tr.cloneNode();
        createDisplayRow( trClone, name, savedJuices[name] );
        $(savedJuicesTable).append(trClone);

    }

}

function createDisplayRow( trEl, name, juice ) {

    var tdEl = document.createElement("td");
    var td = function(html) {
        var t = tdEl.cloneNode();
        t.innerHTML = html || "";
        return t;
    };

    var openFlavorBtn = document.createElement("a");
    openFlavorBtn.innerHTML = name;
    openFlavorBtn.onclick = function() {

        loadJuice( name );


    };

    var nameTD = td();
    nameTD.appendChild(openFlavorBtn);
    var flavorsTD = (function(juice) {

        var html = [];

        for( var field in juice ) {

            if( !(/(Water|PG|VG|targetAmount|name)/.test(field)) ) {

                html.push(field);

            }

        }

        return td( html.join(", ") );

    })(juice);

    var removeTD = document.createElement("td");

    var removeBtn = document.createElement("a");
    removeBtn.innerHTML = "X";
    removeBtn.className = "btn delete";

    removeBtn.onclick = function() {
        removeJuice( name );
        trEl.parentNode.removeChild(trEl);
    };

    removeTD.appendChild(removeBtn);

    trEl.appendChild( nameTD );
    trEl.appendChild( flavorsTD );
    trEl.appendChild( removeTD );

}

//UTILS
function randomString(len, charSet) {
    charSet = charSet || 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var randomString = '';
    for (var i = 0; i < len; i++) {
    	var randomPoz = Math.floor(Math.random() * charSet.length);
    	randomString += charSet.substring(randomPoz,randomPoz+1);
    }
    return randomString;
}


})();
