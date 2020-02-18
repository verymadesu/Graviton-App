import { puffin } from '@mkenzo_8/puffin'
import StaticConfig from 'StaticConfig'
import RunningConfig from 'RunningConfig'
import ExtensionsRegistry from 'ExtensionsRegistry'
import path from 'path'
import requirePath from './require'

import Window from '../constructors/window'
import Menu from '../constructors/menu'
import Dialog from '../constructors/dialog'
import StatusBarItem from '../constructors/status.bar.item'

const fs = requirePath("fs-extra")
const pluginsPath = path.join(StaticConfig.data.configPath,'plugins')

function getExtension(path){
    return require(path)
}

function loadExtension(path){
   return require(path).entry({
       Window,
       puffin,
       Menu,
       Dialog,
       StatusBarItem
    })
}

function loadAutomatically(){
    RunningConfig.on("appLoaded",function(){
        fs.readdir(pluginsPath).then(function(paths){
            paths.map(function(pluginName){
                const pluginPath = path.join(pluginsPath,pluginName)
                const pkgPluginPath = path.join(pluginPath,'package.json')
                if(fs.existsSync(pkgPluginPath)){
                    const pluginPkg = getExtension(pkgPluginPath)
                    pluginPkg.PATH = pluginPath
                    ExtensionsRegistry.add(
                        pluginPkg
                    )
                }
            })
            RunningConfig.emit('allExtensionsLoaded')
            entryAllExtensions()

        })
    })
}

function entryAllExtensions(){
    
    Object.keys(ExtensionsRegistry.registry.data.list).map(function(pluginName){
        const pluginPkg = ExtensionsRegistry.registry.data.list[pluginName]

        if(pluginPkg.main != undefined){
            loadExtension(path.join(pluginPkg.PATH,pluginPkg.main))
        }  
    })   
}

export { loadExtension, loadAutomatically }

/**
 * entry() ->  Initial extension's function, called when the plugin is executed
 */