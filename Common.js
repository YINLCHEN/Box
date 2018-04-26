function doExecute(task) {
    $('#loader').fadeIn("fast");
    $('#btnExecute').attr('disabled', 'disabled');

    var data = new FormData();
    data.append("baseDate", window.document.getElementById("baseDate").value.replace(/\//g, "-"));

    $.ajax({
        type: "POST",
        url: task,
        contentType: false,
        processData: false,
        async: true,
        data: data,
        success: function (res) {
           
            BindViewRateModal(res.CACHEFXSPOT)

            if ('' != res.CACHEFXSPOT) {                
                if ('' != res.CBReporting) {
                    OpenButton('All');
                    BindTable(res.CBReporting);                    
                }
                else {                    
                    DefaultTask();
                    OpenButton('ViewRate');
                    UIHelper.alert('今日無申報交易');
                }                
            }
            else {
                DefaultTask();
                UIHelper.alert('無匯率資料');
            }
        },
        error: function (xhr, status) {
            UIHelper.alert('執行失敗');
            UIHelper.unblockUI();
        },
        complete: function (xhr, status) {
            $('#loader').fadeOut("slow");
            $('#btnExecute').removeAttr('disabled');
            ViewHistoryData();

            $('#blankCheckbox').prop('checked', 'true'); //Test Env Code.

        }
    });
    
}

//Test Env Code.
function TestEnvFunc() {
    var SelectDay = window.document.getElementById("baseDate").value.replace(/\//g, "-")
    var date = new Date();
    var Today = date.getFullYear() + "-" + AppendZero((date.getMonth() + 1)) + "-" + AppendZero(date.getDate());

    if ($('#blankCheckbox').prop('checked') && SelectDay != Today) {
        $('#BindTable input:text').attr('disabled', 'disabled');
        $('#BindTable button').attr('disabled', 'disabled');
        $('#btnUpload').attr('disabled', 'disabled');
        IsToday = false;
    }
    else {
        $('#BindTable input:text').removeAttr('disabled');
        $('#BindTable button').removeAttr('disabled');
        $('#btnUpload').removeAttr('disabled');
        IsToday = true;
    }
}
//-----------------------------------------------------------------

var HaveNullValue = false;
function doUpload(task) {
    var data = new FormData();
    data.append("baseDate", window.document.getElementById("baseDate").value);

    $.each($('#BindTable input:text'), function (key, element) {
        if ('' == element.value) {
            HaveNullValue = true;
        }
    });

    $.each($('#BindTable button'), function (key, element) {        
        if ('' == element.value) {
            HaveNullValue = true;
            var elementID = '#' + element.id;
            $(elementID).attr('style','width:200px; border-color: #A94442;');
        }
    });

    if (CheckInputMaxLength() && !HaveNullValue) {
        $('#loader').fadeIn("fast");
        UIHelper.blockUI();

        $.ajax({
            type: "POST",
            url: task,
            contentType: false,
            processData: false,
            data: data,
            async: true,
            success: function (res) {
                UIHelper.alert(window.document.getElementById("baseDate").value.replace(/\//g, "-") + " " + res);
            },
            error: function (xhr, status) {
                UIHelper.alert('執行失敗');
            },
            complete: function (xhr, status) {
                $('#loader').fadeOut("slow");
                UIHelper.unblockUI();
            }
        });
    }
    else {
        UIHelper.alert('欄位錯誤，無法上傳');
    }

    HaveNullValue = false;
}

//Behavior Functions -----
var IsToday = false;
function ViewHistoryData() {
    var SelectDay = window.document.getElementById("baseDate").value.replace(/\//g, "-")
    var date = new Date();
    var Today = date.getFullYear() + "-" + AppendZero((date.getMonth() + 1)) + "-" + AppendZero(date.getDate());

    if (SelectDay != Today) {
        $('#BindTable input:text').attr('disabled', 'disabled');
        $('#BindTable button').attr('disabled', 'disabled');
        $('#btnUpload').attr('disabled', 'disabled');
        IsToday = false;
    }
    else {
        IsToday = true;
    }
}

function BindViewRateModal(data) {
    $('#root_ViewRateModalContent').empty();

    if (data.length != 0) {
        var trHTML = '<table class="grid table table-hover" style="padding-top: 50px;">';
        trHTML += '<thead><tr class="grid head"><th colspan="3">' + data[0].TDATE + " " + data[0].TTIME + ' 折台匯率</th></tr>';
        trHTML += '<tr class="grid head"><th style="width:50px;" colspan="2" >QUOTATION</th><th style="width:75px;">FXRATE</th></tr></thead><tbody>';

        data.forEach(function (element, index) {
            var QUOTATION = element.QUOTATION;
            trHTML += '<tr><td class="right" style="border-right:0;padding-right:0;">' + QUOTATION.substring(0, 3) + '</td><td class="left" style="border-left:0;padding-left:0;">-' + QUOTATION.substring(4, 7) + '</td><td class="right">' + element.FXRATE + '</td></tr>';
        });

        trHTML += '</tbody></table>';
        $('#root_ViewRateModalContent').append(trHTML);
    }
}

function DefaultTask() {    
    $('#root').empty();
    $('#btnUpload').attr('disabled', 'disabled');
    $('#btnViewRate').attr('disabled', 'disabled');
}

function OpenButton(task) {
    switch (task) {
        case 'Upload':
            $('#btnUpload').removeAttr('disabled');
            break;
        case 'ViewRate':
            $('#btnViewRate').removeAttr('disabled');
            break;
        case 'All':
            $('#btnUpload').removeAttr('disabled');
            $('#btnViewRate').removeAttr('disabled');
            break;
    }
}

var timer = 1;
document.getElementById('btnViewRate').addEventListener('click', function () {
    this.classList.toggle('changed');
    if (++timer % 2 == 0) {
        this.value = "關閉匯率";
    }
    else {
        this.value = "檢視匯率";
    }    
});

function CheckInputMaxLength() {
    var checked = true;
    $.each($('#BindTable input:text'), function (key, element) {
        $('#' + element.id).parent().removeClass();
        if (element.value.length < element.maxLength) {
            element.title = '注意: 此欄位長度為' + element.maxLength;
            $('#' + element.id).tooltip('show');
            $('#' + element.id).parent().addClass('has-error');
            checked = false;
        }
    });

    return checked;
}

//Tool Functions ------
function AmountUSD(TotalAmount, CCY, USD_Rate) {
    if(CCY == 'USD') {
        return TotalAmount;
    }
    else {
        return TotalAmount * USD_Rate;
    }
}

function replaceNull(element) {
    if (element == null) {
        return '';
    }
    else {
        return element;
    }
}

function parseJsonDate(jsonDateString) {
    var fullDate = new Date(parseInt(jsonDateString.substr(6)));
    var twoDigitMonth = (fullDate.getMonth() + 1) + ""; if (twoDigitMonth.length == 1) twoDigitMonth = "0" + twoDigitMonth;
    var twoDigitDate = fullDate.getDate() + ""; if (twoDigitDate.length == 1) twoDigitDate = "0" + twoDigitDate;
    var currentDate = fullDate.getFullYear() + "/" + twoDigitMonth + "/" + twoDigitDate;
    return currentDate;
}

var TableBackgroundColorState = 1;
function getTableBackgroundColor() {
    if (TableBackgroundColorState%2 == 1) {
        return 'background-color:white;';
    }
    else {
        return 'background-color:rgba(199,199,199,0.2);';
    }
}

function AppendZero(obj) {
    if (obj < 10) {
        return "0" + obj;
    }
    else {
        return obj;
    }
}

function DatePickerClick() {
    Action.Execute();
}

function getPosition(element) {
    var x = 0;
    var y = 0;

    while (element) {
        x += element.offsetLeft - element.scrollLeft + element.clientLeft;
        y += element.offsetTop - element.scrollLeft + element.clientTop;
        element = element.offsetParent;
    }

    return { x: x, y: y };
}

function KEYspilter(KEY) {
    var array = [];
    var str = "";
    for (var i = 0; i <= KEY.length; i++) {
        if (KEY.charAt(i) == '_' || i == KEY.length) {
            array.push(str);
            str = '';
        }
        else {
            str += KEY.charAt(i);
        }
    }

    var ObjKey = new Object();
    ObjKey.NB = array[0];
    ObjKey.Contract = array[1];
    ObjKey.CCY = array[2];
    return ObjKey;
}
