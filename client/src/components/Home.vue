<template>
    <div id="home_wrap">
        <div :class="['slide-btn', { 'opa-0': hideBtn }]" @click="packSidebar" v-show="!isPandian">
            <Icon :class="['btn-icon', { pack: isPack }]" type="chevron-left"></Icon>
        </div>
        <div :class="['layout', { 'side-to-left': isPack }]">
            <div class="sidebar" v-show="!isPandian">
                <div class="user-operate">
                    <label>{{logName}}</label>
                    <Button type="ghost" size="small" @click="logout">退出</Button>
                </div>
                <div class="menu-layout">
                    <Menu class="side-menu" width="210px" theme="dark" ref="menu" mode="vertical"
                        v-if="menu.subMenu.length > 0"
                        :active-name="menu.activeName"
                        :open-names="menu.openNames"
                        @on-select="refreshRoute"
                        @on-open-change="twoSubMenu">
                        <template v-for="(sub, subindex) in menu.subMenu">
                            <MenuItem v-if="!sub.subtitle" :name="subindex" :key="subindex + 'b'" v-show="sub.link != '/hello'">
                                <router-link :to="`${sub.link}`" :key="subindex + 'a'" :class="`link`">
                                    <!-- <Icon :type="sub.type"></Icon> -->
                                    <span class="layout-text">{{sub.name}}</span>
                                </router-link>
                            </MenuItem>
                            <Submenu v-if="sub.subtitle" :name="subindex" :key="subindex">
                                <template slot="title">
                                    <!-- <Icon :type="sub.type"></Icon> -->
                                    {{sub.name}}
                                </template>
                                <template v-for="(child, childindex) in sub.subtitle">
                                    <MenuItem v-if="!child.children" :name="`${subindex}-${childindex}`" :key="childindex" :title="child.name">
                                        <router-link :to="`${child.link}`" :key="childindex + 'a'" :class="`link`">
                                            {{child.name}}
                                        </router-link>
                                    </MenuItem>
                                    <Submenu v-if="child.children" :name="`${subindex}-${childindex}`" :key="childindex" ref="twosubmenu" :class="`close none`">
                                        <template slot="title" :style="`background: none`">
                                            <span class="layout-text child-menu">{{child.name}}</span>
                                        </template>
                                        <template v-for="(three, threeindex) in child.children">
                                            <MenuItem :name="`${subindex}-${childindex}-${threeindex}`" ref="threemenuitem" @click.native="threeMenuItem" :title="three.name">
                                                <router-link :to="`${three.link}`" :key="threeindex + 'a'" :class="`link child-menu`">
                                                    {{three.name}}
                                                </router-link>
                                            </MenuItem>
                                        </template>
                                    </Submenu>
                                </template>
                            </Submenu>
                        </template>
                    </Menu>
                </div>
            </div>
            <div :class="['main-ct-wrap', {'nomargin' : isPandian}]">
                <div :class="['main-ct', {'over-auto': overAuto}, {'over-y': isShouhou}, {'heightauto': isPandian}]" :style="{borderBottomWidth: `${mainBottom}px`}">
                    <router-view v-if="isRouterAlive" ref="routerCom" />
                </div>
            </div>
            <!-- <Header :class="`headerBg`">
                <div class="breadcrub-float">
                <Breadcrumb>
                    <BreadcrumbItem v-for="(bread, i) in breadCrumbItem" :key="i">{{bread}}</BreadcrumbItem>
                </Breadcrumb>
                </div>
                <div class="user-operate">
                    <div class="badge-ct pointer" @click="jumpMsgPage">
                        <Badge class-name="badge" :count="messageCount" overflow-count="999" @click="jumpMsgPage">
                            <Icon class="big-font pr-20" type="android-notifications-none"></Icon>
                        </Badge>
                    </div>
                    <label class="mr-20">{{logName}}</label>
                    <Button type="primary" @click="logout">退出</Button>
                </div>
            </Header>
            <Content class="p16">
                <Card>
                    <div class="main-container" ref="contentBody">
                        <router-view/>
                    </div>
                </Card>
            </Content> -->
        </div>
        <!-- 整个页面的loading -->
        <Spin class="home-loading" fix v-if="homeLoading"></Spin>
    </div>
</template>

<script>
    import { deepCopy, handleRequest, initHeaderHeight, getPosition, getLocalStore, normalTime, msgHandler } from 'libs';
    import { mapGetters } from 'vuex';
    export default {
        name: 'Home',
        data () {
            return {
                logName: '',
                hideBtn: false,
                isPack: false,
                isRouterAlive: true,
                timer: null,
                notForbidArr: ['/document/procurement', '/system/storeorder', '/system/toborder'], // 不需要校验权限的页面
                linkArr: [],
                menu: {
                    activeName: '',
                    openNames: [],
                    subMenu: [],
                    // subMenu: [
                    //     {
                    //         type: 'help-buoy',
                    //         name: '欢迎',
                    //         link: '/hello'
                    //     },
                    //     {
                    //         type: 'ios-pricetag',
                    //         name: '基础资料管理',
                    //         subtitle: [
                    //             {
                    //                 name: '基础资料单元',
                    //                 link: '/baseinfomanage/unit'
                    //             },
                    //             {
                    //                 name: '销售单元-仓储单元关系',
                    //                 link: '/baseinfomanage/sku2stock'
                    //             },
                    //             {
                    //                 name: '仓储单元-配件关系',
                    //                 link: '/baseinfomanage/stock2parts'
                    //             }
                    //         ]
                    //     },
                    //     {
                    //         type: 'filing',
                    //         name: '商品管理',
                    //         subtitle: [
                    //             // {
                    //             //     name: '组合型销售单元',
                    //             //     link: '/goodsmanage/suitesku'
                    //             // },
                    //             {
                    //                 name: '销售单元图片管理',
                    //                 link: '/goodsmanage/skuimg'
                    //             },
                    //             {
                    //                 name: '计划发货时间管理',
                    //                 link: '/goodsmanage/plandeliverytime',
                    //                 clink: ['/goodsmanage/plandeliverytime', '/goodsmanage/plandeliverytimecompose']
                    //             }
                    //         ]
                    //     },
                    //     {
                    //         type: 'paper-airplane',
                    //         name: '订单管理',
                    //         subtitle: [
                    //             {
                    //                 name: '订单',
                    //                 link: '/order/orderlist',
                    //                 clink: ['/order/orderdetail']
                    //             },
                    //             {
                    //                 name: '售后列表',
                    //                 link: '/order/afterselllist'
                    //             },
                    //             {
                    //                 name: '售后详情',
                    //                 link: '/order/customerservice'
                    //             },
                    //             {
                    //                 name: '可换货商品管理',
                    //                 link: '/order/canchangegoods'
                    //             }
                    //         ]
                    //     },
                    //     {
                    //         type: 'ionic',
                    //         name: '仓库管理',
                    //         subtitle: [
                    //             {
                    //                 name: '库存表',
                    //                 link: '/stockmanage/stocktable'
                    //             },
                    //             {
                    //                 name: '发货出库',
                    //                 type: 'briefcase',
                    //                 children: [
                    //                     {
                    //                         name: '待发货处理',
                    //                         link: '/stockmanage/pendingdelihandle'
                    //                     },
                    //                     {
                    //                         name: '出库',
                    //                         link: '/stockmanage/outstock?state=0',
                    //                         clink: ['/stockmanage/outstocktransfer', '/stockmanage/outstockrepair']
                    //                     },
                    //                     {
                    //                         name: '拣货汇总',
                    //                         link: '/stockmanage/stockpiking?state=1'
                    //                     }
                    //                 ]
                    //             },
                    //             {
                    //                 name: '收货入库',
                    //                 type: 'briefcase',
                    //                 children: [
                    //                     // {
                    //                     //     name: '仓库待提货',
                    //                     //     link: '/stockmanage/pendingdelivery'
                    //                     // },
                    //                     {
                    //                         name: '入库',
                    //                         link: '/stockmanage/instock?state=0'
                    //                     }
                    //                 ]
                    //             },
                    //             {
                    //                 name: '盘点',
                    //                 link: '/stockmanage/checkstock',
                    //                 clink: ['/stockmanage/checkstockcreate','/stockmanage/checkstockdetail']
                    //             },
                    //             // {
                    //             //     name: '组装拆卸',
                    //             //     type: 'briefcase',
                    //             //     children: [
                    //             //         {
                    //             //             name: '拆卸',
                    //             //             link: '/stockmanage/disassemble',
                    //             //             clink: ['/stockmanage/disassembleone','/stockmanage/disassembletwo', '/stockmanage/disassemblethree']
                    //             //         },
                    //             //         {
                    //             //             name: '组装',
                    //             //             link: '/stockmanage/assemble',
                    //             //             clink: ['/stockmanage/assembleone','/stockmanage/assembletwo', '/stockmanage/assemblethree']
                    //             //         }
                    //             //     ]
                    //             // },
                    //             {
                    //                 name: '移库',
                    //                 link: '/stockmanage/movestock?state=0',
                    //                 clink: ['/stockmanage/movestepone','/stockmanage/movesteptwo']
                    //             },
                    //             {
                    //                 name: '仓库货品状态转换',
                    //                 link: '/stockmanage/goodsstatetransition'
                    //             },
                    //             {
                    //                 name: '库存变更记录',
                    //                 link: `/stockmanage/stockchangerecord?ctime=${normalTime((new Date().getTime() - 30 * 24 * 60 * 60 * 1000), 'ymd')},${normalTime(new Date().getTime() + 1000 * 60 * 60 *24, 'ymd')}`
                    //             },
                    //             {
                    //                 name: '仓库和货位管理',
                    //                 type: 'briefcase',
                    //                 children: [
                    //                     {
                    //                         name: '仓库管理',
                    //                         link: '/stockmanage/stocklist'
                    //                     },
                    //                     {
                    //                         name: '货位管理',
                    //                         link: '/stockmanage/goodsallowlist'
                    //                     }
                    //                 ]
                    //             },
                    //             {
                    //                 name: '物料运输方式管理',
                    //                 link: '/stockmanage/goodstransport'
                    //             }
                    //         ]
                    //     },
                    //     {
                    //         type: 'briefcase',
                    //         name: '采购管理',
                    //         subtitle: [
                    //             {
                    //                 name: '采购单',
                    //                 link: '/purchasemanage/list',
                    //                 clink: ['/purchasemanage/create','/purchasemanage/detail']
                    //             },
                    //             {
                    //                 name: '验收单',
                    //                 link: '/purchasemanage/acceptance'
                    //             },
                    //             // {
                    //             //     name: '工厂待提货',
                    //             //     link: '/purchasemanage/facpendingdelivery'
                    //             // },
                    //             {
                    //                 name: '入厂单',
                    //                 link: '/purchasemanage/infactory'
                    //             },
                    //             {
                    //                 name: '归库单',
                    //                 link: '/purchasemanage/transferorder',
                    //                 clink: ['/purchasemanage/transferorder/detail']
                    //             },
                    //             {
                    //                 name: '工厂库存表',
                    //                 link: '/purchasemanage/factorystocktable'
                    //             },
                    //             {
                    //                 name: '供应商管理',
                    //                 link: '/purchasemanage/supplier'
                    //             },
                    //             {
                    //                 name: '采购物料管理',
                    //                 link: '/purchasemanage/purmateriel'
                    //             }
                    //         ]
                    //     },
                    //     {
                    //         type: 'pie-graph',
                    //         name: '门店销售管理',
                    //         subtitle: [
                    //             {
                    //                 name: '门店订单列表',
                    //                 link: '/system/morderlist'
                    //             },
                    //             {
                    //                 name: '门店订单草稿',
                    //                 link: '/system/sorderlist'
                    //             },
                    //             {
                    //                 name: '门店管理',
                    //                 link: '/system/store'
                    //             },
                    //             {
                    //                 name: '门店员工管理',
                    //                 link: '/system/sstaff'
                    //             },
                    //         ]
                    //     },
                    //     {
                    //         type: 'briefcase',
                    //         name: '系统管理',
                    //         subtitle: [
                    //             {
                    //                 name: '用户管理',
                    //                 link: '/system/usermanage'
                    //             },
                    //             {
                    //                 name: '角色权限管理',
                    //                 link: '/system/permission'
                    //             }
                    //         ]
                    //     }
                    // ]
                },
                breadCrumbItem: [],
                messageCount: 0,
            }
        },
        computed: {
            ...mapGetters([
                'overAuto',
                'mainBottom',
                'refreshMenu',
                'headerOffTop',
                'logoutFlag',
                'goPerm',
                'homeLoading'
            ]),
            isShouhou(){
                if(this.$route.path === '/order/customerservice'){
                    return true
                }else{
                    return false
                }
            },
            isPandian(){
                if(this.$route.path === '/document/procurement' && (this.$route.query.type == 3 || this.$route.query.type == 4 || this.$route.query.type == 1)){
                    return true
                }else{
                    return false
                }
            }
        },
        created() {
            // handleRequest('get', '/api/sys/login', null, res => {
            //     let _data1 = res.data;
            //     if(_data1.success) {

            // 	} else {
            //         // 未登录，跳登录页
            //         this.$router.replace('/login');
            //     }
            // }, err => {
            //     msgHandler('error', '请求失败请重试', this);
            //     console.log(err);
            // });
            this.getPerms(); // 获取权限
            // 判断是否为windows客户端
            if(navigator.platform.indexOf('Win') > -1) {
                this.$store.dispatch('changeToWin');
            }
        },
        mounted() {
            // let winHeight = window.outerHeight - 220;
            // this.$refs.contentBody.style.height = winHeight + 'px';
            // window.addEventListener('scroll', this.handleScroll);
            document.querySelector('.main-ct').addEventListener('scroll', () => {
                this.handleScroll();
            }); // 滚动时固定表头
            window.addEventListener('resize', initHeaderHeight(this));
        },
        beforeDestroy() {
            this.timer ? clearTimeout(this.timer) : null;
        },
        watch: {
            // refreshMenu(val) {
            //     if(val) {
            //         this.refreshBraedCrumbItem();
            //         this.$store.dispatch('resetSetMenu');
            //     }
            // },
            logoutFlag(boo) {
                if(boo) {
                    this.logout();
                }
            },
            goPerm(boo) { // 更新权限
                this.getPerms();
            },
			$route(to, from) {
                // if(to.name === 'Procurement') {
                //     !this.isPack ? this.packSidebar() : null;
                //     !this.hideBtn ? this.hideBtn = true : null;
                // } else if(from.name === 'Procurement') {
                //     this.isPack ? this.packSidebar() : null;
                //     this.hideBtn ? this.hideBtn = false : null;
                // }
                if(this.linkArr.length !== 0 && !this.notForbidArr.includes(to.path) && !this.linkArr.includes(to.path) && to.path !== '/') {
                    // msgHandler('warning', '您没有该权限', this, 5);
                    return;
                    // this.$router.replace('/hello');
                }
                this.refreshBraedCrumbItem();
                this.$store.dispatch('resetSetMenu');
                // this.$ready(() => {
                //     initHeaderHeight(this);
                // });
			}
        },
        methods: {
            getPerms() {
                handleRequest('get', '/api/sys/perms/get', null, res => {
                    let _data = res.data;
                    // console.log(deepCopy(_data))
                    if(_data.success) {
                        this.menu.subMenu = _data.subMenu;
                        // console.log(deepCopy(this.menu.subMenu))
                        // 得到所有链接
                        let linkArr = [],
                            nowPath = this.$route.path;
                        this.menu.subMenu.forEach(one => {
                            // .match(/.*\/([^?]*)/)[0]
                            if(one.link) {
                                linkArr.push(one.link.match(/.*\/([^?]*)/)[0]); // 取得不含参数和哈希的path
                            }
                            if(one.subtitle && one.subtitle.length > 0) {
                                one.subtitle.forEach(two => {
                                    if(two.link) {
                                        linkArr.push(two.link.match(/.*\/([^?]*)/)[0]);
                                    }
                                    if(two.clink && two.clink.length > 0) {
                                        two.clink.forEach(x => linkArr.push(x.match(/.*\/([^?]*)/)[0]));
                                    }
                                    if(two.children && two.children.length > 0) {
                                        two.children.forEach(x => {
                                            if(x.link) {
                                                linkArr.push(x.link.match(/.*\/([^?]*)/)[0]);
                                            }
                                            if(x.clink) {
                                                x.clink.forEach(child => linkArr.push(child.match(/.*\/([^?]*)/)[0]));
                                            }
                                        });
                                    }
                                });
                            }
                        });
                        // 如果没有权限，就跳转到欢迎页
                        if(!this.notForbidArr.includes(nowPath) && !linkArr.includes(nowPath) && nowPath !== '/' && nowPath !== '/login') {
                            this.$router.replace('/hello');
                            msgHandler('warning', '您没有该权限', this, 5);
                        }
                        this.linkArr = linkArr;
                        this.$store.dispatch('savePerms', {
                            notForbidArr: this.notForbidArr,
                            linkArr: this.linkArr
                        });
                        this.refreshBraedCrumbItem();
                        this.logName = this.$cookies.get('logName');
                        // setInterval(this.getMessageCount, 300000);
                        if(this.goPerm) {
                            this.$store.dispatch('backPerm');
                        }
                    } else {
                        msgHandler('error', _data.msg , this);
                    }
                }, err => {
                    msgHandler('error', '菜单请求失败请刷新页面', this);
                    console.log(err);
                });
            },
            // 控制表头固定
            handleScroll() {
                const el = document.querySelector('.main-ct');
                // const scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop;
                const scrollTop = el.pageYOffset || el.scrollTop;
                if(scrollTop > this.headerOffTop) {
                    this.$store.dispatch('fixHeader');
                } else {
                    this.$store.dispatch('noFixHeader');
                }
                // if(this.$refs.routerCom && this.$refs.routerCom.$refs && this.$refs.routerCom.$refs.dropCom) {
                //     // 滑动关闭dropdown，暂时
                //     if(this.$refs.routerCom.$refs.dropCom.length) {
                //         this.$refs.routerCom.$refs.dropCom[0].handleClose();
                //     }else {
                //         this.$refs.routerCom.$refs.dropCom.handleClose();
                //     }

                // }
                el.click(); // 模拟点击外面，关闭dropdown
                // this.isFixed = scrollTop > offsetTop ? true : false;
            },
            // 菜单权限
            // getPerms() {
            //     handleRequest('get', '/api/sys/auth/perms', null, res => {
            //         let _data = res.data;
            //         console.log(_data)
            //         if(_data.success) {

            //     	} else {
            //             msgHandler('warning', _data.msg, this, 4);
            //         }
            //     }, err => {
            //         msgHandler('error', '请求失败请重试', this);
            //         console.log(err);
            //     });
            // },
            packSidebar() {
                this.isPack = !this.isPack;
                initHeaderHeight(this); // 宽度重绘可能会导致筛选标签容器高度变化，所以重新计算
                // 如果更改侧边栏为动画，则需改为在动画结束后执行getWidths
                setTimeout(() => {
                    this.$refs.routerCom.getWidths ? this.$refs.routerCom.getWidths() : null;
                }, 10);
            },
            //获取剩余消息数量
            getMessageCount() {
                this.axios.get('/api/commen/sysmsg/shownum').then(res => {
                    if(res.data.success) {
                        this.messageCount = res.data.num;
                    }
                }).catch(err => console.log(err));
            },
            // 登出
            logout(){
                this.$cookies.remove('loggedIn');
                this.batchRemoveStore();
                location.reload();
                this.axios.get('/api/account/logout').then(res => {
                    if(res.data.success) {
                        // 啥也不做
                    }
                }).catch(err => console.log(err));
            },
            batchRemoveStore() {
                // 清除厂店通缓存
                let arr = [];
                for (let i = 0; i < localStorage.length; i++){
                    if (localStorage.key(i).substring(0,4) == 'cdt_') {
                        arr.push(localStorage.key(i));
                    }
                }
                for (var i = 0; i < arr.length; i++) {
                    localStorage.removeItem(arr[i]);
                }
            },
            // 选择菜单
            onSelectHandle(name){
                this.breadCrumbItem = [];
                if (typeof(name) == 'number') {
                    this.breadCrumbItem[0] = this.menu.subMenu[name].name;
                }else{
                    let _name = name.split('-');
                    this.breadCrumbItem[0] = this.menu.subMenu[_name[0]].name;
                    this.breadCrumbItem[1] = this.menu.subMenu[_name[0]].subtitle[_name[1]].name;
                    if (_name.length > 2) {
                        this.breadCrumbItem[2] = this.menu.subMenu[_name[0]].subtitle[_name[1]].children[_name[2]].name;
                        this.timer = setTimeout(() => {
                            this.$refs.twosubmenu[0].$parent.$el.classList.add('ivu-menu-item-active');
                        },1);
                    }else{
                        this.$refs.twosubmenu ? this.$refs.twosubmenu[0].$el.classList.add('color') : null;
                    }
                };
            },
            // 选择二级菜单标题
            twoSubMenu(arr){
                /*this.$refs.twosubmenu.forEach(t => {
                    t.$el.classList.forEach(c => {
                        if (c === 'close') {
                            c.remove('close');
                        }
                    });
                    _isContains ? t.$el.classList.remove('close') : t.$el.classList.add('close');
                });        */
                this.menu.openNames = arr;
                this.$refs.menu.$children.forEach(x => {
                    if(x.opened && !this.menu.openNames.includes(x.name)) {
                        this.menu.openNames.push(x.name);
                    }
                    x.$children.forEach(child => {
                        if(child.opened && !this.menu.openNames.includes(child.name)) {
                            this.menu.openNames.push(child.name);
                        }
                    });
                });
                // console.log(this.$refs.menu)
                // console.log(this.menu.openNames)
            },
            // 选择三级菜单
            threeMenuItem(){
                /*setTimeout(() => {
                    this.$refs.twosubmenu[0].$el.classList.remove('close');
                    this.$refs.twosubmenu[0].$el.classList.remove('color');
                }, 1);*/
            },
            // 相同路径下强制刷新当前路由
            routerReload() {
                this.isRouterAlive = false;
                this.$ready(() => this.isRouterAlive = true);
            },
            refreshRoute(name) {
                let _path = this.$route.path;
                const arr = ['/stockmanage/pendingdelihandle', '/stockmanage/outstock', '/stockmanage/transoutstock', '/stockmanage/repairoutstock', '/stockmanage/instock', '/stockmanage/transinstock'];
                // 点击刷新路由
                if(arr.includes(_path)) {
                    this.routerReload();
                }
            },
            // 获取面包屑路径
            refreshBraedCrumbItem(isClick) {
                let _path = this.$route.path,
                    _name = '',
                    that = this;
                // 点击刷新路由
                // if(isClick && (_path === '/stockmanage/pendingdelihandle' || _path === '/stockmanage/outstock')) {
                //     this.routerReload();
                // }
                if(_path === '/') {
                    return;
                }
                this.menu.subMenu.forEach((m, index1) => {
                    if (m.subtitle && m.subtitle.length > 0) {
                        m.subtitle.forEach((n, index2) => {
                            if (n.children && n.children.length > 0) {
                                // children级页面
                                n.children.forEach((c, index3) => {
                                    if (c.link == _path || c.link.indexOf(_path) !== -1 || (c.clink && c.clink.indexOf(_path) !== -1)) {
                                        _name = index1+'-'+index2+'-'+index3;
                                        // that.menu.openNames = [index1, index1+'-'+index2]; // 全部展开
                                        if(!that.menu.openNames.find(x => x + '' === index1 + '')) {
                                            that.menu.openNames.push(index1);
                                        }
                                        if(!that.menu.openNames.find(x => x + '' === index1+'-'+index2)) {
                                            that.menu.openNames.push(index1+'-'+index2);
                                        }
                                        return;
                                    }
                                });
                            }else{
                                // 一级页面
                                if (n.link == _path || n.link.indexOf(_path) !== -1 || (n.clink && n.clink.indexOf(_path) !== -1)) {
                                    _name = index1+'-'+index2;
                                    // that.menu.openNames = [index1];
                                    if(!that.menu.openNames.find(x => x + '' === index1 + '')) {
                                        that.menu.openNames.push(index1);
                                    }
                                    return;
                                }
                            }
                        });
                    }
                    else if (m.link == _path || m.link.indexOf(_path) !== -1) {
                        _name = index1;
                        // that.menu.openNames = [index1];
                        if(!that.menu.openNames.find(x => x + '' === index1 + '')) {
                            that.menu.openNames.push(index1);
                        }
                        return;
                    };
                });
                if(!_name) {
                    return;
                } else {
                    this.menu.activeName = _name;
                    this.onSelectHandle(this.menu.activeName);
                }
                this.$nextTick(() => {
                    this.$refs.menu.updateOpened();
                    this.$refs.menu.updateActiveName();
                });
                this.$ready(() => {
                    initHeaderHeight(this);
                });
            },
            jumpMsgPage() {
                this.$router.push('/msgpage');
            }
        }
    }
</script>

<style scoped>
    /* .layout { display: flex; } */
    @keyframes slideOut {
        from {
            transform: translate3d(0, 0, 0);
        }
        to {
            transform: translate3d(-100%, 0, 0);
            left: -210px;
        }
    }
    .sidebar {
        position: fixed;
        top: 0;
        left: 0;
        bottom: 0;
        width: 210px;
        overflow: hidden;
        /* transition: all .5s cubic-bezier(0,0.8,0.5,1) .1s; */
    }
    .side-to-left .sidebar {
        /* animation: slideOut .4s;
        animation-fill-mode: forwards; */
        left: -210px;
    }
    .sidebar .menu-layout {
        /* width: 100%; */
        /* height: 100%; */
        /* padding-right: 28px; */
        width: calc(100% + 20px)!important;
        height: calc(100% - 51px);
        background-color: #495060;
        overflow-y: auto;
        /* box-sizing: content-box; */
    }
    .slide-btn {
        position: fixed;
        top: 50%;
        left: 0;
        display: flex;
        justify-content: center;
        align-items: center;
        width: 15px;
        height: 60px;
        background: #fff;
        border: 1px solid #dddee1;
        border-radius: 6px;
        border-top-left-radius: 0;
        border-bottom-left-radius: 0;
        transform: translateY(-50%);
        transition: all .3s;
        cursor: pointer;
        z-index: 901; /* iview菜单组件z-index为900 */
    }
    .slide-btn:hover {
        background: #e9eaec;
    }
    .slide-btn .btn-icon {
        font-size: 120%;
        font-weight: bold;
        transition: all .3s;
    }
    .slide-btn .btn-icon.pack {
        transform: rotate(180deg);
    }
    /* 给spin组件一个区域，不让其覆盖侧边栏，且main-ct高度会改变，所以要包容器 */
    .main-ct-wrap {
        position: relative;
        margin-left: 220px;
        /* transition: all .5s cubic-bezier(0,0.8,0.5,1) .1s; */
    }
    .nomargin{ margin-left: 0; }
    .main-ct {
        /* flex-grow: 1; */
        /* position: relative; */
        height: 100vh;
        /* margin: 0 0 10px 220px; */
        margin: 0 0 10px 0;
        padding: 0 10px 10px 0;
        border-top: 10px solid #fff;
        border-bottom: 90px solid #fff;
        background: #fff;
        overflow: hidden;
    }
    .heightauto{ height: auto }
    .side-to-left .main-ct-wrap {
        margin-left: 10px;
    }
    .main-ct.over-auto { overflow: auto; }
    .main-ct.over-y { overflow-y: overlay !important; }
    .ml-250 { margin-left: 250px;}
    .headerBg {
        background: #fff;
        padding: 0 16px;
    }
    .p16 { padding: 6px 6px 0 6px;}
    .p16:hover,
    .p16:hover div { box-shadow: none;}
    .breadcrub-float { float: left;}
    .user-operate {
        padding: 14px 24px 8px;
        border-bottom: 5px solid #363e4f;
        background: #495060;
        color: #fff;
        font-size: 13px;
        font-weight: bold;
    }
    .user-operate .ivu-btn {
        margin-left: 8px;
        background: #fff;
    }
    .mr-20 { margin-right: 20px; }
    .link { color: rgba(255,255,255,.7);}
    .ivu-menu-item-selected .link { color: #fff;}
    .ivu-menu-item .link .layout-text { padding-left: 7px;}
    .ivu-menu-vertical .ivu-menu-item,
    .ivu-menu-vertical .ivu-menu-submenu-title { padding: 0;}
    .ivu-menu-vertical .ivu-menu-item a,
    .ivu-menu-vertical .ivu-menu-submenu-title a {
        padding: 14px 24px;
        display: block;
    }
    .ivu-menu-vertical .ivu-menu-submenu-title a.can-link { padding: 0 5px;}
    .ivu-menu-vertical .ivu-menu-submenu .ivu-menu-item a {
        padding-left: 5px;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        -o-text-overflow: ellipsis;
    }
    .child-menu { padding-left: 5px;}
    .ivu-menu-vertical .ivu-menu-item a.child-menu { padding-left: 0px;}
    .main-container{
        padding: 0 16px 55px 0;
        overflow: auto;
    }
</style>
<style>
    .ivu-card-body { padding-right: 0;}
    .ivu-menu-submenu.close .ivu-menu-submenu-title-icon {
        position: absolute;
        top: 50%;
        right: 24px;
        transform: rotate(0deg) translateY(-50%);
    }
    .ivu-menu-dark.ivu-menu-vertical .ivu-menu-submenu .ivu-menu .ivu-menu-item-active.none,
    .ivu-menu-dark.ivu-menu-vertical .ivu-menu-opened .ivu-menu-submenu .ivu-menu-submenu-title { background: none!important;}
    .ivu-menu-dark.ivu-menu-vertical .color .ivu-menu-submenu-title { color: rgba(255,255,255,.7)!important;}
    .ivu-menu-dark.ivu-menu-vertical .ivu-menu-submenu .ivu-menu .ivu-menu-item-active .ivu-menu-item-active { background: #2d8cf0;}
</style>
