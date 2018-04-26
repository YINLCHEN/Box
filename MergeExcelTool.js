@using Ibt.MxAddonPlatform.Service;
@{
    ViewBag.Title = "Merge Excel Tool";
}

<div style="margin-top: 20px;">
    <h3>@ViewBag.Title </h3>
    <span id="label_MergeStatus" class="label MergeStatus" style="display:none"></span>
</div>
<div id="ErrorMessage" style="color:red">@ViewBag.ErrorMessage</div>
<hr />
<div class="form-horizontal">
    @using (Html.BeginForm("Index", "MergeExcelTool", FormMethod.Post, new { @class = "form-horizontal", @enctype = "multipart/form-data", role = "form", name = "form1" }))
    {
        @Html.AntiForgeryToken()

        <div class="panel-group" id="accordion" role="tablist" aria-multiselectable="true">
            <div class="panel panel-default">
                <div class="panel-heading" role="tab" id="headingOne">
                    <h4 class="panel-title">
                        <a id="btnCollapseOne" role="button" data-toggle="collapse" data-parent="#accordion" href="#collapseOne" aria-expanded="true" aria-controls="collapseOne">
                            Step1. 選擇報表
                        </a>
                        <span id="tableWaringMessage"
                              style="display:none"
                              class="glyphicon glyphicon-info-sign text-danger"
                              data-toggle="tooltip"
                              data-placement="top"
                              title="※此報表合併技術使用Template，如欲更改格式，請聯絡IT">
                        </span>
                    </h4>
                    <div class="collapseMemo" id="collapseMemoOne"></div>
                </div>
                <div id="collapseOne" class="panel-collapse collapse in" role="tabpanel" aria-labelledby="headingOne">
                    <div class="panel-body">
                        <div class="dropdown">
                            <button class="btn btn-default dropdown-toggle" style="width:600px;" type="button" id="dropdownMenu1" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">
                                選取報表格式<span class="caret"></span>
                            </button>
                            <ul class="dropdown-menu" aria-labelledby="dropdownMenu1" style="width:600px;">
                                @{
                                    var tableNameMapping = MergeService.InitTable();
                                    foreach (var mapping in tableNameMapping)
                                    {
                                        string tableId = @mapping.Key;
                                        tableId = tableId.Replace("Table", "表");
                                        <li><a name="ToggleTableList" data-value="@mapping.Key"><div style="width:30px;color:forestgreen;font-weight:bold;">@tableId</div>@mapping.Value</a></li>
                                    }
                                }
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
            <div class="panel panel-default">
                <div class="panel-heading" role="tab" id="headingTwo">
                    <h4 class="panel-title">
                        <!-- <a class="collapsed" role="button" data-toggle="collapse" data-parent="#accordion" href="#collapseTwo" aria-expanded="false" aria-controls="collapseTwo"> -->
                        Step2. 上傳檔案
                    </h4>
                    <div class="collapseMemo" id="collapseMemoTwo"></div>
                </div>
                <div id="collapseTwo" class="panel-collapse collapse" role="tabpanel" aria-labelledby="headingTwo">
                    <div class="panel-body">
                        <div class="form-group">
                            <div class="col-md-5">
                                <input type="file" name="fileUpload" class="filestyle" onclick='Action.Reset(false)' />
                            </div>
                            <div class="hidden-xs hidden-sm hidden-md">
                                <img class="img" src="~/pic/Add.png" />
                            </div>
                        </div>
                        <div class="form-group">
                            <div class="col-md-5">
                                <input type="file" name="fileUpload" class="filestyle" onclick='Action.Reset(false)' />
                            </div>
                            <div class="hidden-xs hidden-sm hidden-md">
                                <img class="img" src="~/pic/Add.png" id="imgAdd2" style="display:none" />
                            </div>
                        </div>
                        <div id="reportUpload3" class="form-group" style="display:none">
                            <div class="col-md-5">
                                <input type="file" name="fileUpload" class="filestyle" onclick='Action.Reset(false)' />
                            </div>
                            <div class="hidden-xs hidden-sm hidden-md"></div>
                        </div>
                        <input type="button" value="下一步" class="btn btn-success" onclick='btnNextTwoToThree()' style="margin-right:9px;">
                        <input type="button" id="btnOptionReport3" value="上傳第三支報表" class="btn btn-info" onclick='OptionReport3("toggle")'>
                    </div>

                </div>
            </div>
            <div class="panel panel-default">
                <div class="panel-heading" role="tab" id="headingThree">
                    <h4 class="panel-title">
                        <!-- <a class="collapsed" role="button" data-toggle="collapse" data-parent="#accordion" href="#collapseThree" aria-expanded="false" aria-controls="collapseThree"> -->
                        Step3. 執行合併
                    </h4>
                </div>
                <div id="collapseThree" class="panel-collapse collapse" role="tabpanel" aria-labelledby="headingThree">
                    <div class="panel-body">
                        <input type="button" value="合併報表" class="btn btn-success" id="btn_Merge" style="margin-right:9px;">
                        <input type="button" value="上一步" class="btn btn-warning" id="btn_BackThreeTotwo" onclick='btnBackThreeToTwo()'>
                        <input type="button" value="重新執行" class="btn btn-danger" id="btn_Clear" onclick='Action.Reset(true)'>
                    </div>
                </div>
            </div>
            <div class="panel panel-default">
                <div id="collapseFour" class="panel-collapse collapse CoolCollapse" role="tabpanel" aria-labelledby="headingFour">
                    <div class="panel-body">
                        <div id="collapseContentFour"></div>
                    </div>
                </div>
            </div>
        </div>
}
</div>

@section Scripts {
    <script type="text/javascript" src="~/Scripts/bootstrap-filestyle.min.js"></script>

    <script type="text/javascript">
        $(":file").filestyle({ buttonBefore: true });
        $(":file").filestyle('buttonText', '選取報表');

        var Action = new Container();
        function Container(param) {
            var isExcute = false; //有無執行程式flag，目的:若有選取檔案，判斷為False時，則不Reset
            var $form = $('form[name=form1]');

            var selectTableId;
            var haveThreeReport = false;

            //檢查兩個檔案是否有選取
            this.CheckFileSelect = function () {
                var fileUpload = document.getElementsByName('fileUpload');

                //只上傳兩個檔案
                var fileNums = fileUpload.length;
                if (!Action.haveThreeReport) {
                    fileNums--;
                }

                for (var i = 0; i < fileNums; i++) {
                    var filename = $.trim(fileUpload[i].value);
                    if (filename.length == 0) {
                       // Action.Reset(true);
                        UIHelper.alert('請先選擇檔案');
                        return false;
                    }
                }

                if (Action.selectTableId == '') {
                    UIHelper.alert('請先選擇欲合併報表');
                    return false;
                }

                return true;
            }

            //執行合併程式
            this.Execute = function () {
                var data = new FormData();
                var fileUpload = document.getElementsByName('fileUpload');
                var fileNums = fileUpload.length;
                if (!Action.haveThreeReport) {
                    fileNums--;
                }

                data.append("tableId", this.selectTableId);
                for (var i = 0; i < fileNums; i++) {
                    var file = fileUpload[i].files;
                    data.append("FileUpload", file[0]);
                }

                $.ajax({
                    type: "POST",
                    url: '@Url.Action("MergeExcel", "MergeExcelTool")',
                    contentType: false,
                    processData: false,
                    data: data,
                    async: true,
                    success: function (res) {

                        $('#collapseContentFour').empty();

                        if (res.IsValid) {
                            window.location.href = '@Url.Action("DownloadExcel", "MergeExcelTool")';
                            Action.TaskSuccess();
                            Action.isExcute = true;

                            if (0 != res.ConsoleMessage.length) {
                                $('#collapseFour').collapse('show');
                                $('#collapseContentFour').append("合併警告，部分欄位未合併，訊息如下:<br/>")
                                $('#collapseContentFour').append(res.ConsoleMessage);
                            }
                            else {
                                $('#collapseFour').collapse('hide');
                            }
                        }
                        else {                            
                            if (0 != res.ValidMessage.length) {
                                $('#collapseFour').collapse('show');
                                $('#collapseContentFour').append(res.ValidMessage);
                            }
                            else {
                                $('#collapseFour').collapse('hide');
                            }

                            Action.TaskFail();
                        }

                        UIHelper.unblockUI();
                    },
                    error: function (xhr, status) {
                        UIHelper.alert('執行失敗');
                        UIHelper.unblockUI();
                    }
                });

                $('#btn_Clear').show();
            }

            //成功時，狀態變更
            this.TaskSuccess = function () {
                $('#dropdownMenu1').removeClass();
                $('#dropdownMenu1').addClass('btn btn-success dropdown-toggle');
                $('#label_MergeStatus').removeClass('label-warning');
                $('#label_MergeStatus').addClass('label-success');
                $('#label_MergeStatus').text('Success');
                $('#label_MergeStatus').show();
                $('#btnBackThreeToTwo').hide();
            }

            //失敗時，狀態變更
            this.TaskFail = function () {
                $('#dropdownMenu1').removeClass();
                $('#dropdownMenu1').addClass('btn btn-warning dropdown-toggle');
                $('#label_MergeStatus').removeClass('label-success');
                $('#label_MergeStatus').addClass('label-warning');
                $('#label_MergeStatus').text('Fail');
                $('#label_MergeStatus').show();
                $('#btnBackThreeToTwo').show();
                UIHelper.unblockUI();
            }

            //Reset Form
            this.Reset = function (execute) {
                if (isExcute || execute) {
                    $form.trigger('reset');
                    $('#dropdownMenu1').text('選取報表格式並執行合併 ');
                    $('#dropdownMenu1').append('<span class="caret"></span>');
                    $('#dropdownMenu1').removeClass();
                    $('#dropdownMenu1').addClass('btn btn-default dropdown-toggle');
                    $('#label_MergeStatus').hide();
                    $('#collapseMemoOne').text('');
                    $('#collapseMemoTwo').children().remove();
                    $('#collapseContentFour').empty();
                    $('#collapseOne').collapse('show');
                    $('#collapseTwo').collapse('hide');
                    $('#collapseThree').collapse('hide');
                    $('#collapseFour').collapse('hide');
                    $('#tableWaringMessage').hide();
                    OptionReport3("close");
                    Action.selectTableId = '';
                    isExcute = false;
                }
            }
        };

        $('[name="ToggleTableList"]').click(function () {
            $('#collapseOne').collapse('hide');
            $('#collapseTwo').collapse('show');
        });



        $('#btn_Merge').bind("click", function () {
            UIHelper.blockUI();
            if (Action.CheckFileSelect()) {
                Action.Execute();
            }
        });

        $('[data-toggle="tooltip"]').tooltip();
        $('.dropdown-menu li a').bind("click", function () {
            Action.selectTableId = $(this).attr('data-value');
            $('#dropdownMenu1').text($(this).text());

            var showMessage = false;
            switch (Action.selectTableId) {
                case 'AI701':
                    showMessage = true;
                    break;
            }
            if (showMessage) {
                $('#tableWaringMessage').show();
            }
            else {
                $('#tableWaringMessage').hide();
            }

            $('#collapseMemoOne').text($(this).text());

        });

        $('#btnCollapseOne').bind("click", function () {
            $('#collapseOne').collapse('show');
            $('#collapseTwo').collapse('hide');
            $('#collapseThree').collapse('hide');
            $('#collapseFour').collapse('hide');
        })

        function btnNextTwoToThree() {
            if (Action.CheckFileSelect()) {
                var set = document.getElementsByName("fileUpload");
                var memo = '<div>';
                for (var i = 0; i < set.length; i++) {
                    if (set[i].files[0] != null && $("input[name$='fileUpload']").eq(i).is(":hidden") != true) {
                        memo += set[i].files[0].name + "<br/>";
                    }
                }
                memo += '</div>';

                $('#collapseMemoTwo').children().remove();
                $('#collapseMemoTwo').append(memo);

                $('#collapseTwo').collapse('hide');
                $('#collapseThree').collapse('show');
            }
        }

        function btnBackThreeToTwo() {
            Action.isExcute = false;
            $('#collapseTwo').collapse('show');
            $('#collapseThree').collapse('hide');
            $('#collapseFour').collapse('hide');
            $('#label_MergeStatus').hide();
        }

        function OptionReport3(func) {
            switch (func) {
                case "toggle":
                    if ($('#reportUpload3').is(':hidden')) {
                        $('#reportUpload3').show();
                        $('#btnOptionReport3').val('取消上傳第三支報表');
                        Action.haveThreeReport = true;
                        $('#imgAdd2').show();
                    }
                    else {
                        $('#reportUpload3').hide();
                        $('#btnOptionReport3').val('上傳第三支報表');
                        Action.haveThreeReport = false;
                        $('#imgAdd2').hide();
                    }
                    break;
                case "close":
                    $('#reportUpload3').hide();
                    $('#btnOptionReport3').val('上傳第三支報表');
                    Action.haveThreeReport = false;
                    $('#imgAdd2').hide();
                    break;
                default:
                    console.log("OptionReport3 Fail!");
                    break;
            }
        }

    </script>
}

@section Styles {
    <style type="text/css">
        h3, span {
            display: inline;
        }

        #dropdownMenu1, .bootstrap-filestyle {
            width: 400px;
        }

        .btn-default {
            width: 120px;
        }

        .clearbtn {
            width: 50px;
        }

        .img {
            position: relative;
            height: 40px;
            width: 40px;
            top: 20px;
        }

        .MergeStatus {
            position: relative;
            top: -5px;
        }

        .collapseMemo {
            padding-left: 10px;
        }

        .btn-success {
            width: 82px;
        }

        .CoolCollapse {
            background-color: rgba(0, 0, 0, 0.6);
            color: white;
        }
    </style>
}
