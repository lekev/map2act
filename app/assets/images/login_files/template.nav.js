(function(){
Template.__define__("nav", (function() {
  var self = this;
  var template = this;
  return HTML.Raw('<!-- BEGIN HEADER -->\n    <div class="header navbar navbar-inverse">\n        <!-- BEGIN TOP NAVIGATION BAR -->\n        <div class="navbar-inner">\n            <!-- BEGIN NAVIGATION HEADER -->\n            <div class="header-seperation">\n                <!-- BEGIN MOBILE HEADER -->\n                <ul class="nav pull-left notifcation-center" id="main-menu-toggle-wrapper" style="display:none">\n                    <li class="dropdown">\n                        <a id="main-menu-toggle" href="#main-menu" class="">\n                            <div class="iconset top-menu-toggle-white"></div>\n                        </a>\n                    </li>\n                </ul>\n                <!-- END MOBILE HEADER -->\n                <!-- BEGIN LOGO -->\n                <a href="#">\n                    <img src="assets/img/logo.png" class="logo" alt="" data-src="assets/img/logo.png" data-src-retina="assets/img/logo2x.png" width="106" height="21">\n                </a>\n                <!-- END LOGO -->\n                <!-- BEGIN LOGO NAV BUTTONS -->\n                <ul class="nav pull-right notifcation-center">\n                    <li class="dropdown" id="header_task_bar">\n                        <a href="#" class="dropdown-toggle active" data-toggle="">\n                            <div class="iconset top-home"></div>\n                        </a>\n                    </li>\n                    <li class="dropdown" id="header_inbox_bar">\n                        <a href="#" class="dropdown-toggle">\n                            <div class="iconset top-messages"></div>\n                            <span class="badge" id="msgs-badge">2</span>\n                        </a>\n                    </li>\n                    <!-- BEGIN MOBILE CHAT TOGGLER -->\n                    <li class="dropdown" id="portrait-chat-toggler" style="display:none">\n                        <a href="#sidr" class="chat-menu-toggle">\n                            <div class="iconset top-chat-white"></div>\n                        </a>\n                    </li>\n                    <!-- END MOBILE CHAT TOGGLER -->\n                </ul>\n                <!-- END LOGO NAV BUTTONS -->\n            </div>\n            <!-- END NAVIGATION HEADER -->\n            <!-- BEGIN CONTENT HEADER -->\n            <div class="header-quick-nav">\n                <!-- BEGIN HEADER LEFT SIDE SECTION -->\n                <div class="pull-left">\n                    <!-- BEGIN SLIM NAVIGATION TOGGLE -->\n                    <ul class="nav quick-section">\n                        <li class="quicklinks">\n                            <a href="#" class="" id="layout-condensed-toggle">\n                                <div class="iconset top-menu-toggle-dark"></div>\n                            </a>\n                        </li>\n                    </ul>\n                    <!-- END SLIM NAVIGATION TOGGLE -->\n                    <!-- BEGIN HEADER QUICK LINKS -->\n                    <ul class="nav quick-section">\n                        <li class="quicklinks">\n                            <a href="#" class="">\n                                <div class="iconset top-reload"></div>\n                            </a>\n                        </li>\n                        <li class="quicklinks">\n                            <span class="h-seperate"></span>\n                        </li>\n                        <li class="quicklinks">\n                            <a href="#" class="">\n                                <div class="iconset top-tiles"></div>\n                            </a>\n                        </li>\n                        <!-- BEGIN SEARCH BOX -->\n                        <li class="m-r-10 input-prepend inside search-form no-boarder">\n                            <span class="add-on">\n                                <span class="iconset top-search"></span>\n                            </span>\n                            <input name="" type="text" class="no-boarder" placeholder="Search Dashboard" style="width:250px;">\n                        </li>\n                        <!-- END SEARCH BOX -->\n                    </ul>\n                    <!-- BEGIN HEADER QUICK LINKS -->\n                </div>\n                <!-- END HEADER LEFT SIDE SECTION -->\n                <!-- BEGIN HEADER RIGHT SIDE SECTION -->\n                <div class="pull-right">\n                    <div class="chat-toggler">\n                        <!-- BEGIN NOTIFICATION CENTER -->\n                        <a href="#" class="dropdown-toggle" id="my-task-list" data-placement="bottom" data-content="" data-toggle="dropdown" data-original-title="Notifications">\n                            <div class="user-details">\n                                <div class="username">\n                                    <span class="badge badge-important">3</span>&nbsp;John\n                                    <span class="bold">&nbsp;Smith</span>\n                                </div>\n                            </div>\n                            <div class="iconset top-down-arrow"></div>\n                        </a>\n                        <div id="notification-list" style="display:none">\n                            <div style="width:300px">\n                                <!-- BEGIN NOTIFICATION MESSAGE -->\n                                <div class="notification-messages info">\n                                    <div class="user-profile">\n                                        <img src="assets/img/profiles/d.jpg" alt="" data-src="assets/img/profiles/d.jpg" data-src-retina="assets/img/profiles/d2x.jpg" width="35" height="35">\n                                    </div>\n                                    <div class="message-wrapper">\n                                        <div class="heading">Title of Notification</div>\n                                        <div class="description">Description...</div>\n                                        <div class="date pull-left">A min ago</div>\n                                    </div>\n                                    <div class="clearfix"></div>\n                                </div>\n                                <!-- END NOTIFICATION MESSAGE -->\n                            </div>\n                        </div>\n                        <!-- END NOTIFICATION CENTER -->\n                        <!-- BEGIN PROFILE PICTURE -->\n                        <div class="profile-pic">\n                            <img src="assets/img/profiles/avatar_small.jpg" alt="" data-src="assets/img/profiles/avatar_small.jpg" data-src-retina="assets/img/profiles/avatar_small2x.jpg" width="35" height="35">\n                        </div>\n                        <!-- END PROFILE PICTURE -->\n                    </div>\n                    <!-- BEGIN HEADER NAV BUTTONS -->\n                    <ul class="nav quick-section">\n                        <!-- BEGIN SETTINGS -->\n                        <li class="quicklinks">\n                            <a data-toggle="dropdown" class="dropdown-toggle pull-right" href="#" id="user-options">\n                                <div class="iconset top-settings-dark"></div>\n                            </a>\n                            <ul class="dropdown-menu pull-right" role="menu" aria-labelledby="user-options">\n                                <li><a href="#">Normal Link</a>\n                                </li>\n                                <li><a href="#">Badge Link&nbsp;&nbsp;<span class="badge badge-important animated bounceIn">2</span></a>\n                                </li>\n                                <li class="divider"></li>\n                                <li><a href="#"><i class="fa fa-power-off"></i>&nbsp;&nbsp;Separated Link</a>\n                                </li>\n                            </ul>\n                        </li>\n                        <!-- END SETTINGS -->\n                        <li class="quicklinks">\n                            <span class="h-seperate"></span>\n                        </li>\n                        <!-- BEGIN CHAT SIDEBAR TOGGLE -->\n                        <li class="quicklinks">\n                            <a id="chat-menu-toggle" href="#sidr" class="chat-menu-toggle">\n                                <div class="iconset top-chat-dark">\n                                    <span class="badge badge-important hide" id="chat-message-count">1</span>\n                                </div>\n                            </a>\n                            <!-- BEGIN OPTIONAL RECENT CHAT POP UP NOTIFICATION -->\n                            <div class="simple-chat-popup chat-menu-toggle hide">\n                                <div class="simple-chat-popup-arrow"></div>\n                                <div class="simple-chat-popup-inner">\n                                    <div style="width:100px">\n                                        <div class="semi-bold">Name</div>\n                                        <div class="message">Message...</div>\n                                    </div>\n                                </div>\n                            </div>\n                            <!-- END OPTIONAL RECENT CHAT POP UP NOTIFICATION -->\n                        </li>\n                        <!-- END CHAT SIDEBAR TOGGLE -->\n                    </ul>\n                    <!-- END HEADER NAV BUTTONS -->\n                </div>\n                <!-- END HEADER RIGHT SIDE SECTION -->\n            </div>\n            <!-- END CONTENT HEADER -->\n        </div>\n        <!-- END TOP NAVIGATION BAR -->\n    </div>\n    <!-- END HEADER -->');
}));

})();