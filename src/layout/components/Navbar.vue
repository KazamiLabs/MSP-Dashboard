<template>
  <div class="navbar">
    <hamburger
      :is-active="sidebar.opened"
      class="hamburger-container"
      @toggleClick="toggleSideBar"
    />

    <breadcrumb class="breadcrumb-container" />

    <div class="right-menu">
      <div class="queues-loading">
        <el-tooltip :content="queuesBtnTips" effect="dark" placement="top-end">
          <el-button
            :type="queuesBtnType"
            class="el-button-micro"
            :icon="queuesBtnIcon"
            size="mini"
            circle
            @click="$router.push({ name: 'Dashboard' })"
          />
        </el-tooltip>
      </div>

      <screenfull id="screenfull" class="right-menu-item hover-effect" />

      <error-log class="errLog-container right-menu-item" />

      <lang-select class="international right-menu-item" />

      <el-dropdown class="avatar-container" trigger="click">
        <div class="avatar-wrapper">
          <img :src="avatar" class="user-avatar">
          <i class="el-icon-caret-bottom" />
        </div>
        <el-dropdown-menu slot="dropdown" class="user-dropdown">
          <router-link to="/">
            <el-dropdown-item v-t="'navbar.home'" />
          </router-link>
          <router-link to="/profile">
            <el-dropdown-item v-t="'navbar.changeAvatar'" />
          </router-link>
          <a target="_blank" href="javascript:void(0)" @click="handleToPortal">
            <el-dropdown-item>Portal</el-dropdown-item>
          </a>
          <a target="_blank" href="javascript:void(0)" @click="handleToTelescope">
            <el-dropdown-item>Telescope</el-dropdown-item>
          </a>
          <el-dropdown-item divided>
            <span v-t="'navbar.logout'" style="display:block;" @click="logout" />
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { toPortal } from '@/api/user'
import { getQueues } from '@/api/publish'
import { fetchEchoSetting } from '@/api/settings'
import Breadcrumb from '@/components/Breadcrumb'
import Hamburger from '@/components/Hamburger'
import Screenfull from '@/components/Screenfull'
import LangSelect from '@/components/LangSelect'
import ErrorLog from '@/components/ErrorLog'
import Echo from 'laravel-echo'

export default {
  components: {
    Breadcrumb,
    Hamburger,
    Screenfull,
    LangSelect,
    ErrorLog
  },
  data() {
    return {
      queuesBtnType: 'primary',
      queuesBtnLoading: true,
      queuesBtnTips: '',
      queuesInterval: null,
      echo: null,
      checkQueuesLock: false
    }
  },
  computed: {
    ...mapGetters(['sidebar', 'avatar']),
    queuesBtnIcon() {
      return this.queuesBtnLoading ? 'el-icon-loading' : 'el-icon-check'
    }
  },
  created() {
    this.queuesBtnTips = this.$t('navbar.queueProcess')
  },
  mounted() {
    this.checkQueues()
    window.Pusher = require('pusher-js')
    fetchEchoSetting()
      .then(response => {
        this.echo = new Echo(response.data)
        this.echo
          .channel('Queues')
          .listen('SyncQueuesChange', data => {
            if (this.checkQueuesLock) {
              return
            }
            this.checkQueuesLock = true
            this.checkQueues()
              .finally(_ => {
                this.checkQueuesLock = false
              })
          })
      })
  },
  destroyed() {
    if (this.echo) {
      this.echo
        .leave('Queues')
    }
  },
  methods: {
    toggleSideBar() {
      this.$store.dispatch('app/toggleSideBar')
    },
    handleToPortal() {
      toPortal().then(() => {
        window.open('/')
      })
    },
    handleToTelescope() {
      toPortal().then(() => {
        window.open('/telescope')
      })
    },
    checkQueues() {
      return getQueues().then(res => {
        const { list, length, has_done } = res.data
        this.commitQueuesData(list, length, has_done)
      })
    },
    commitQueuesData(list, length, has_done) {
      this.$store.dispatch('app/storeQueues', list)
      this.$store.dispatch('app/storeQueuesLength', length)
      if (has_done) {
        this.queuesBtnType = 'success'
        this.queuesBtnTips = this.$t('navbar.queueCompile')
        this.queuesBtnLoading = false
      } else {
        this.queuesBtnType = 'primary'
        this.queuesBtnTips = this.$t('navbar.queueProcess')
        this.queuesBtnLoading = true
      }
    },
    async logout() {
      await this.$store.dispatch('user/logout')
      this.$router.push(`/login?redirect=${this.$route.fullPath}`)
    },
    handleToChangeAvatar() {
      console.log('hello world')
    }
  }
}
</script>

<style lang="scss" scoped>
.navbar {
  height: 50px;
  overflow: hidden;
  position: relative;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);

  .hamburger-container {
    line-height: 46px;
    height: 100%;
    float: left;
    cursor: pointer;
    transition: background 0.3s;
    -webkit-tap-highlight-color: transparent;

    &:hover {
      background: rgba(0, 0, 0, 0.025);
    }
  }

  .breadcrumb-container {
    display: inline-block;
    width: calc(100% - 365px);
  }

  .right-menu {
    display: inline-block;
    width: 300px;
    height: 100%;
    line-height: 50px;
    text-align: right;

    > * {
      display: inline-block;
      margin-right: 10px;
    }

    .queues-loading {
      vertical-align: top;
    }

    &:focus {
      outline: none;
    }

    .right-menu-item {
      display: inline-block;
      padding: 0 8px;
      height: 100%;
      font-size: 18px;
      color: #5a5e66;
      vertical-align: text-bottom;

      &.hover-effect {
        cursor: pointer;
        transition: background 0.3s;

        &:hover {
          background: rgba(0, 0, 0, 0.025);
        }
      }
    }

    .avatar-container {
      margin-right: 30px;

      .avatar-wrapper {
        margin-top: 5px;
        position: relative;

        .user-avatar {
          cursor: pointer;
          width: 40px;
          height: 40px;
          border-radius: 10px;
        }

        .el-icon-caret-bottom {
          cursor: pointer;
          position: absolute;
          right: -20px;
          top: 25px;
          font-size: 12px;
        }
      }
    }
  }
}

.user-dropdown {
  top: 38px !important;
  left: auto !important;
  right: 10px !important;
}
</style>
