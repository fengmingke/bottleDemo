// 全局console
var console = window.console || { log: function (txt) { } };
// 捡到的某个漂流瓶数据
var bottle = null;
var bottles = null;
var user = '';
var _id = '';
//
$('#throw').on('click', function() {
  $('.tips-title').text('扔一个漂流瓶');
  $('.tips-throw').show();
  $('.tips-pick,.tips-mybottle,.tips-reply').hide();
  $('.tips-module').show();
});
$('#pick').on('click', function() {
  $('.tips-title').text('检一个漂流瓶');
  $('#pickTxt').html('');
  $('#pick-head').show();
  $('#throwBack,#reply').hide();
  $('.tips-pick').show();
  $('.tips-throw,.tips-mybottle,.tips-reply').hide();
  $('.tips-module').show();
});
$('#mybottle').on('click', function() {
  $('.tips-title').text('我的瓶子');
  $('.mybottle-head').show();
  $('.mybottle-cont').hide();
  $('#mybottleTxt').html('');
  $('.tips-mybottle').show();
  $('.tips-pick,.tips-throw,.tips-reply').hide();
  $('.tips-module').show();
});
//
$('.close-cont').on('click', function() {
  $('.tips-module').hide();
});
//扔漂流瓶
$('#throwOut').on('click', function() {
  $('.tips-throw span').text('');
  // $("input[name='sex']:checked")[0].value;
  var sex = $("input[name='sex']:checked").val();
  // $("input[name='lname']")[0].value;
  // $("input[name='lname']").val();
  var ln = $('#lname').val();
  ln = $.trim(ln);
  if (ln == '') {
    $('.tips-throw span').text('用户名不能为空!');
    return;
  }
  var txt = $('#txt').val();
  txt = $.trim(txt);
  if (txt == '') {
    $('.tips-throw span').text('内容不能为空!');
    return;
  }
  var json = {'owner': ln, 'type': sex, 'content': txt};
  $.ajax({
    type: 'POST',
    url: 'http://127.0.0.1:8362/bottle/throw',
    // url: 'http://bottle.coolnodejs.com/bottle/throw',
    data: json,
    dataType: 'json',
    success: function(data) {
      console.log(data);
      if(data.code == 1){
        $('.tips-throw span').text('已成功扔出去了，再扔一个试试!');
      }else{
        $('.tips-throw span').text(data.msg);
      }
    }
  });
});
// pickBottle
$('#pickBottle').on('click', function() {
  $('.tips-pick p').text('');
  var pn = $('#pname').val();
  pn = $.trim(pn);
  if (pn == '') {
    $('.tips-pick p').text('用户名不能为空!');
    return;
  }
  user = pn;
  //检一个漂流瓶
  $.ajax({
    type: 'GET',
    url: 'http://127.0.0.1:8362/bottle/pick?user=' + pn,
    // url: 'http://bottle.coolnodejs.com/bottle/pick?user=' + pn,
    dataType: 'json',
    success: function(data) {
      // {code: 1, msg: {content: "dherjej", owner: "hjk", time: "1541433195550", type: "female"}}
      console.log(data);
      if(data.code == 1){
        bottle = data.msg;
        var str = data.msg.owner + " 说：" + data.msg.content;
        $('#pickTxt').html(str);
        $('#pick-head').hide();
        $('#throwBack,#reply').show();
      }else{
        $('#pickTxt').html(data.msg);
        $('#throwBack,#reply').hide();
      }
    }
  });
});
// throwBack
$('#throwBack').on('click', function() {
  $('.tips-pick p').text('');
  var json = {'user': user, 'owner': bottle.owner, 'type': bottle.type, 'time': bottle.time, 'content': bottle.content};
  $.ajax({
    type: 'POST',
    url: 'http://127.0.0.1:8362/bottle/throwBack',
    // url: 'http://bottle.coolnodejs.com/bottle/throwBack',
    data: json,
    dataType: 'json',
    success: function(data) {
      console.log(data);
      $('.tips-module').hide();
    }
  });
});
// reply
$('#reply').on('click', function() {
  $('.tips-title').text('我的瓶子');
  $('#mybottleTxt').text('');
  $('.mybottle-head').hide();
  $('.mybottle-cont').html('');
  $('.mybottle-cont').show();
  $('.tips-mybottle').show();
  $('.tips-pick,.tips-throw,.tips-reply').hide();
  showBottles();
});
// showMybottle
$('#showMybottle').on('click', function() {
  $('#mybottleTxt').text('');
  var dn = $('#dname').val();
  dn = $.trim(dn);
  if (dn == '') {
    $('#mybottleTxt').text('用户名不能为空!');
    return;
  }
  user = dn;
  showBottles();
});
//获取用户捡到的所有漂流瓶
function showBottles(){
  $.ajax({
    type: 'GET',
    url: 'http://127.0.0.1:8362/bottle/user/' + user,
    // url: 'http://bottle.coolnodejs.com/bottle/user/' + user,
    dataType: 'json',
    success: function(data) {
      // {"code":1,"msg":[{"_id":"5be07c4b2660e21ad02092d5","bottle":["mhd"],"message":[["mhgm","1541438197811","dgsfjmtjstr"]]},{"_id":"5be07c7e2660e21ad02092d6","bottle":["mhd"],"message":[["mhgm","1541438197811","dgsfjmtjstr"]]},{"_id":"5be07c842660e21ad02092d7","bottle":["mhd"],"message":[["mhg","1541438203815","dgsfjmtjstrbdbsad"]]}]}
      console.log(data);
      if(data.code == 1){
        bottles = data.msg;
        var len = bottles.length;
        var blen = 0;
        var str = "";
        var html = "";
        var bottle;
        for(var i=0;i<len;i++){
          bottle = bottles[i];
          blen = bottle.message.length;
          str = bottle.message[blen-1][0] + " 说：" + bottle.message[blen-1][2];
          console.log(str);
          html += '<div class="mybottle-item" data-id="' + bottle._id + '">'
                + '<p class="b-cont">' + str + '</p>'
                + '<div class="button-cont">'
                + '<button class="replyBottle" type="button">回应</button>'
                + '<button class="deleteBottle" type="button">删除</button>'
                + '<p class="bottle-tips"></p>'
                + '</div></div>';
        }
        $('.mybottle-cont').html(html);
        $('.mybottle-head').hide();
        $('.mybottle-cont').show();
      }else{
        $('.mybottle-head').show();
        $('.mybottle-cont').hide();
        $('#mybottleTxt').html(data.msg);
      }
    }
  });
}
//
$('.mybottle-cont').on('click', function(e) {
  if(e.target.className == 'replyBottle'){
    console.log(e.target);
    console.log(e.target.className);
    var p = e.target.parentNode.parentNode;
    _id = p.getAttribute("data-id");
    console.log(_id);
    $('.tips-title').text('回应漂流瓶');
    $('.reply-cont').html('');
    $('.tips-reply').show();
    $('.tips-pick,.tips-throw,.tips-mybottle').hide();
    $('.reply-btn p').text('');
    //获取特定_id的漂流瓶
    $.ajax({
      type: 'GET',
      url: 'http://127.0.0.1:8362/bottle/getId/' + _id,
      // url: 'http://bottle.coolnodejs.com/bottle/getId/' + _id,
      dataType: 'json',
      success: function(data) {
        // {"code":1,"msg":{"_id":"5be07c842660e21ad02092d7","bottle":["mhd","mhg"],"message":[["mhg","1541438203815","dgsfjmtjstrbdbsad"],["mhd",1541563714264,"fsgjsfksrtsmrts"]]}}
        console.log(data);
        if(data.code == 1){
          bottle = data.msg;
          displayReply();
        }else{
          $('.reply-btn p').text(data.msg);
        }
      }
    });
  }else if(e.target.className == 'deleteBottle'){
    console.log(e.target);
    console.log(e.target.className);
    var ps = e.target.parentNode.parentNode.parentNode;
    console.log(ps);
    var p = e.target.parentNode.parentNode;
    console.log(p);
    var id = p.getAttribute("data-id");
    console.log(id);
    var tips = e.target.nextSibling.nextSibling;
    console.log(tips);
    //删除特定_id的漂流瓶
    $.ajax({
      type: 'GET',
      url: 'http://127.0.0.1:8362/bottle/delete/' + id,
      // url: 'http://bottle.coolnodejs.com/bottle/delete/' + id,
      dataType: 'json',
      success: function(data) {
        // {code: 1, msg: '删除成功!'}
        console.log(data);
        if(data.code == 1){
          ps.removeChild(p);
        }else{
          // $('.bottle-tips').html(data.msg);
          tips.innerHTML = "删除失败";
        }
      }
    });
  }
});
// 回复漂流瓶
$('#replyOut').on('click', function() {
  $('.reply-btn p').text('');
  var txt = $('#replyTxt').val();
  txt = $.trim(txt);
  if (txt == '') {
    $('.reply-btn p').text('内容不能为空!');
    return;
  }
  var json = {'user': user, 'content': txt};
  $.ajax({
    type: 'POST',
    url: 'http://127.0.0.1:8362/bottle/reply/' + _id,
    // url: 'http://bottle.coolnodejs.com/bottle/reply' + _id,
    data: json,
    dataType: 'json',
    success: function(data) {
      //{"code":1,"msg":{"_id":"5be07c842660e21ad02092d7","bottle":["mhd","mhg"],"message":[["mhg","1541438203815","dgsfjmtjstrbdbsad"],["mhd",1541563714264,"fsgjsfksrtsmrts"]]}}
      console.log(data);
      if(data.code == 1){
        bottle = data.msg;
        displayReply();
      }else{
        $('.reply-btn p').text(data.msg);
      }
    }
  });
});
//display reply
function displayReply(){
  var msg = bottle.message;
  var len = msg.length;
  var str = '';
  var html = '';
  for(var i=0;i<len;i++){
    str = msg[i][0] + " 说：" + msg[i][2];
    console.log(str);
    html += '<p>' + str + '</p>';
  }
  $('.reply-cont').html(html);
}
