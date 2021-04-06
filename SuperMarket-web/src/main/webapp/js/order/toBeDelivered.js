$(function () {

    var search_status; // 状态
    var pageSize;  // 当前页显示条数
    var pageNo; // 当前页码
    var url;

   // 使用mustache模板
   var toBeDeliveredListTemplate = $("#toBeDeliveredListTemplate").html();
   Mustache.parse(toBeDeliveredListTemplate);

   loadToBeDeliveredList();

    $("#pageSize").click(function (e) {
        e.preventDefault();
        $("#toBeDeliveredPage .pageNo").val(1);
        loadToBeDeliveredList();
    });

   // 渲染待付款列表
   function loadToBeDeliveredList(newurl) {
       pageSize = $("#pageSize").val();
       pageNo = $("#toBeDeliveredPage .pageNo").val() || 1;
       // 判断是否传进来了url
       if (newurl){
           url = newurl;
       }else{
           url = "/order/handleOrder.json";
       }
       search_status = $("#search_status").val();
        $.ajax({
           url: url,
           type: "POST",
           data: {
              search_status:search_status,
               pageSize:pageSize,
               pageNo:pageNo
           },
           success: function (result) {
               renderedToBeDeliveredListAndPage(result,url);
           }
        });
   }
   function renderedToBeDeliveredListAndPage(result,url) {
       if (result.status == "success"){
           url = "/order/handleOrder.json";
           search_status = $("#search_status").val(); // 获取状态
           if (result.data.total > 0){
               var rendered = Mustache.render(toBeDeliveredListTemplate, {
                   "toBeDeliveredList": result.data.records,
                   "pay_time": function () {
                       return function (text, render) {
                           return new Date(
                               this.payTime)
                               .Format("yyyy-MM-dd");
                       }
                   },
                   "showStatus": function () {
                       return this.orderStatus == 1 ? '待付款'
                           : (this.orderStatus == 2 ? '待发货'
                               :(this.orderStatus == 3 ? '待收货'
                                   : "已完成"));
                   },
                   "bold": function () {
                       return function (text, render) {
                           var status = render(text);
                           if (status == '待付款') {
                               return "<span class='label label-sm label-danger'>待付款</span>";
                           } else if (status == '待发货') {
                               return "<span class='label label-sm label-warning'>待发货</span>";
                           } else if (status == '待收货') {
                               return "<span class='label label-sm label-warning'>待收货</span>";
                           } else {
                               return "<span class='label'>已完成</span>";
                           }
                       }
                   }
               });
               $("#toBeDeliveredList").html(rendered);
           } else {
               $("#toBeDeliveredList").html("");
           }
           bindClickOrder();
           pageSize = $("#pageSize").val();
           pageNo = $("#toBeDeliveredPage .pageNo").val() || 1;
           // 渲染分页页码
           renderPage(
               url,
               result.data.total,
               pageNo,
               pageSize,
               result.data.total > 0 ? result.data.records .length : 0,
               "toBeDeliveredPage",
               loadToBeDeliveredList,
               false);
       }else {
           showMessage("获取待发货列表", result.msg, false);
       }
   }
   
   function bindClickOrder() {

       // 查看订单详细
       $(".see-order").click(function (e) {
           // 阻止默认事件
           e.preventDefault();
           e.stopPropagation();
           // 获取订单号
           var orderId = $(this).attr('data-id');
           $.ajax({
               url: "/order/orderList.json",
               type: "POST",
               data: {
                   orderId : orderId
               },
               success : function (result) {
                   if (result.status == "success"){
                       if (result.data.length > 0){
                           // 弹出框
                           $('#dialog-order-form').dialog({
                               model:true,
                               title: "订单详细",
                               open: function (event, ui) {
                                   // 清空表单
                                   $("#orderForm table tr:not(:first)").empty("");
                                   $.each(result.data, function (i, product) {
                                       var str = "<tr>" +
                                                    "<td class='center'>" + product.productName+ "</td>" +
                                                    "<td class='center'>" + product.number + "</td>" +
                                                 "</tr>"
                                       $("#orderForm table").append(str);
                                   });

                               }
                           });
                       }
                   }
               }
           });
       });

   }



});