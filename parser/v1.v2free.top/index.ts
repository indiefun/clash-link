import * as yaml from "https://deno.land/std@0.187.0/yaml/mod.ts";
import { Yaml, Parser, Profile } from "../type.ts";

const parser: Parser = {
    parse(raw: Yaml, share?: boolean): Yaml {
        const obj = yaml.parse(raw) as Profile

        {
            // filter proxies and custom proxy-groups
            const proxies = obj.proxies
            const vmess = []
            const ssName = []
            const usProxies = []
            const sgProxies = []
            const jpProxies = []
            const shareArr = []
            const shareProxies = []
            const unShareProxies = []
            for (let i = 0; i < proxies.length; i++) {
                const proxy = proxies[i]
                if (share) {
                    if (proxy.name.includes('不限流量')){
                        shareProxies.push(proxy.name)
                        shareArr.push(proxy)
                    } else {
                        unShareProxies.push(proxy.name)
                    }
                }
                if (proxy.type === 'vmess') {
                    if (proxy.name.includes('美国'))
                        usProxies.push(proxy.name)
                    else if (proxy.name.includes('狮城'))
                        sgProxies.push(proxy.name)
                    else if (proxy.name.includes('日本'))
                        jpProxies.push(proxy.name)
                    vmess.push(proxy)
                } else {
                    ssName.push(proxy.name)
                }
            }
            const groups = obj['proxy-groups']
            for (let i = 0; i < groups.length; i++) {
                const group = groups[i]
                const proxies = []
                if (share) {
                    if (group.name.includes('全球'))
                        continue

                    for (let j = 0; j < group.proxies.length; j++) {
                        const name = group.proxies[j]
                        if (!unShareProxies.includes(name)) {
                            proxies.push(name)
                        }
                        if (shareProxies.includes(name))
                            proxies.push(name)
                    }
                }
                else {
                    for (let j = 0; j < group.proxies.length; j++) {
                        const name = group.proxies[j]
                        if (!ssName.includes(name)) {
                            proxies.push(name)
                        }
                    }
                    if (group.name === '🔰 节点选择') {
                        proxies.unshift('JP')
                        proxies.unshift('SG')
                        proxies.unshift('US')
                    }
                }
                group.proxies = proxies
            }
            const prependGroup = {
                type: 'url-test',
                url: 'http://www.gstatic.com/generate_204',
                interval: 300,
            }
            const groupUS = {
                name: 'US',
                ...prependGroup,
                proxies: usProxies
            }

            const groupSG = {
                name: 'SG',
                ...prependGroup,
                proxies: sgProxies
            }

            const groupJP = {
                name: 'JP',
                ...prependGroup,
                proxies: jpProxies
            }

            if (share) {
                obj.proxies = shareArr
            }
            else {
                groups.unshift(groupJP)
                groups.unshift(groupSG)
                groups.unshift(groupUS)

                obj.proxies = vmess
            }
        }

        {
            // custom rule
            if (share) {
                obj.rules.unshift(
                    'DOMAIN,chat.openai.com,🔰 节点选择',
                    'DOMAIN-SUFFIX,openai.com,🔰 节点选择',
                    'DOMAIN-SUFFIX,bing.com,🔰 节点选择',
                    'DOMAIN-SUFFIX,github.com,🔰 节点选择',
                    'DOMAIN-SUFFIX,githubusercontent.com,🔰 节点选择',
                    'DOMAIN-SUFFIX,v2free.top,DIRECT',
                    'DOMAIN-SUFFIX,deno.dev,DIRECT',
                    'DOMAIN-SUFFIX,luming.fun,DIRECT',
                    'DOMAIN-SUFFIX,aliyun.com,DIRECT',
                )
            }
            else {
                obj.rules.unshift(
                    'DOMAIN,chat.openai.com,US',
                    'DOMAIN-SUFFIX,openai.com,SG',
                    'DOMAIN-SUFFIX,bing.com,US',
                    'DOMAIN-SUFFIX,github.com,🔰 节点选择',
                    'DOMAIN-SUFFIX,githubusercontent.com,🔰 节点选择',
                    'DOMAIN-SUFFIX,v2free.top,DIRECT',
                    'DOMAIN-SUFFIX,deno.dev,DIRECT',
                    'DOMAIN-SUFFIX,luming.fun,DIRECT',
                    'DOMAIN-SUFFIX,aliyun.com,DIRECT',
                )
            }
        }

        return yaml.stringify(obj)
    },
}

export default parser;
