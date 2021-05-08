'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = Component({
  behaviors: [],
  properties: {
    canvasName: {
      type: String,
      value: "tempShareView",
    },
    info: {
      type: Object,
      value: {}
    },

  },
  data: {
    widthPx: 0,
    heightPx: 0,
  },
  attached: function onAttached() {

    let that = this
    wx.getSystemInfo({
      success: function(res) {
        let winheight = res.windowHeight
        let winWidth = res.windowWidth
        let _widthPx = winWidth * 0.6333
        let _heightPx = winheight * 0.657
        that.setData({
          widthPx: _widthPx,
          heightPx: _heightPx
        })
        if (that.data.info) {
          that.drawShareView()
        }

      },
    })
  },
  methods: {
    preventPopup: function preventPopup(e) {

    },
    onCanvasSaved: function onCanvasSaved(path) {
      var eventDetail = {
        imgPath: path
      }
      // 触发事件的选项 bubbles是否冒泡，composed是否可穿越组件边界，capturePhase 是否有捕获阶段
      var eventOption = {
        composed: true
      }
      this.triggerEvent('onShareImgSave', eventDetail, eventOption);
    },
    drawShareView: function drawShareView() {
      const ctx = wx.createCanvasContext(this.data.canvasName, this)
      this.drawBackground(ctx)
      this.drawShopHeader(ctx)
      this.drawShopGoods(ctx)
      this.drawShopBottom(ctx)
      this.drawShopQRCode(ctx)
      let that = this
      ctx.draw(true, () => {
        wx.canvasToTempFilePath({
          canvasId: that.data.canvasName,
          success: res => {
            that.onCanvasSaved(res.tempFilePath)
          },
          fail: msg => {
            console.log(`fail ${JSON.stringify(msg)}`)
          }
        }, that)

      })
    },
    drawBackground: function drawBackground(ctx) {
      ctx.setFillStyle("white")
      ctx.fillRect(0, 0, this.data.widthPx, this.data.heightPx)
    },
    drawShopHeader: function drawShopHeader(ctx) {
      let vOffset = this.autoSize(42)
      let nameFontSize = this.autoSize(30)
      let marginLeft = this.autoSize(20)
      let avatarSize = this.autoSize(70)

      ctx.setFontSize(nameFontSize)
      let nameWith = ctx.measureText(this.data.info.shop.name).width
      let startX = this.centerStartX([avatarSize, marginLeft, nameWith])
      ctx.save()
      ctx.beginPath()
      ctx.arc(startX + avatarSize / 2, vOffset + avatarSize / 2, avatarSize / 2, 0, 2 * Math.PI)
      ctx.fill()
      ctx.clip()
      ctx.drawImage(this.data.info.shop.path, startX, vOffset, avatarSize, avatarSize)
      ctx.closePath()
      ctx.restore()
      ctx.setTextBaseline('middle')
      ctx.setFillStyle('black')
      ctx.fillText(this.data.info.shop.name, startX + avatarSize + marginLeft, vOffset + avatarSize / 2)

      let desFontSize = this.autoSize(30)
      let desRectWidth = this.data.widthPx * 0.90
      let desRectHeight = this.autoSize(120)
      let desRectX = this.centerStartX([desRectWidth])
      let desRectY = this.autoSize(140)
      let r = desRectHeight / 8

      ctx.setFillStyle('#f7f7f7')
      this.fillRoundRect(desRectX, desRectY, desRectWidth, desRectHeight, r, ctx)

      ctx.moveTo(desRectX - 5 + desRectWidth / 2, desRectY)
      ctx.lineTo(desRectX + desRectWidth / 2, desRectY - 5)
      ctx.lineTo(5 + desRectX + desRectWidth / 2, desRectY)
      ctx.fill()

      ctx.setFillStyle('black')
      ctx.setFontSize(desFontSize)
      let desEllipsis = this.singleLine(this.data.info.shop.des, desRectWidth - desFontSize * 3, desFontSize, ctx)
      ctx.fillText(desEllipsis, this.centerStartX([ctx.measureText(desEllipsis).width]), this.autoSize(140) + this.autoSize(60))

    },

    drawShopGoods: function drawShopGoods(ctx) {
     
      let shareType = this.data.info.shareType

      if (shareType == 'goodsDetail') {
        this.drawGoodsDetail(ctx)
      } else {
        let count = this.data.info.goods.length
        if (count > 1) {
          this.drawShopGoodsTemplateTwo(ctx)
        } else if (count == 1) {
          this.drawShopGoodsTemplateOne(ctx)
        }
      }

    },

    drawShopGoodsTemplateTwo: function drawShopGoodsTemplateTwo(ctx) {
      let vOffset = this.autoSize(290)
      let imgSize = this.autoSize(318)
      let margin = (this.data.widthPx - 2 * imgSize) / 3
      let goodsOne = this.data.info.goods[0]
      this.drawRoundImage(margin, vOffset, imgSize, imgSize, 8, goodsOne.path, ctx)
      let nameMarginTop = this.autoSize(38)
      let nameY = vOffset + imgSize + nameMarginTop
      let nameFontSize = this.autoSize(23)
      let nameMaxWidth = imgSize - nameFontSize * 2
      let nameText = goodsOne.name
      let nameColor = "#80848f"
      this.drawTextLines(margin + nameFontSize, nameY, 2, nameMaxWidth, nameFontSize, nameColor, nameText, ctx)
      let priceY = this.autoSize(124) + vOffset + imgSize
      this.drawTextBold(margin + nameFontSize, priceY, `￥${parseInt(goodsOne.price||0)}`, nameFontSize * 1.2, 'black', ctx)

      let goodsTwo = this.data.info.goods[1]
      this.drawRoundImage(margin * 2 + imgSize, vOffset, imgSize, imgSize, 8, goodsTwo.path, ctx)
      this.drawTextLines(margin * 2 + imgSize + nameFontSize, nameY, 2, nameMaxWidth, nameFontSize, nameColor, goodsTwo.name, ctx)
      this.drawTextBold(margin * 2 + imgSize + nameFontSize, priceY, `￥${parseInt(goodsTwo.price||0)}`, nameFontSize * 1.2, 'black', ctx)
    },
    drawShopGoodsTemplateOne: function drawShopGoodsTemplateOne(ctx) {
      let vOffset = this.autoSize(290)
      let imgSize = this.autoSize(318)
      let margin = this.data.widthPx * 0.05
      let goodsOne = this.data.info.goods[0]
      this.drawRoundImage(margin, vOffset, this.data.widthPx - margin * 2, imgSize, 8, goodsOne.path, ctx)
      let nameMarginTop = this.autoSize(38)
      let nameY = vOffset + imgSize + nameMarginTop
      let nameFontSize = this.autoSize(23)
      let nameMaxWidth = this.data.widthPx - (nameFontSize + margin) * 2
      let nameText = goodsOne.name
      let nameColor = "#80848f"
      this.drawTextLines(margin + nameFontSize, nameY, 2, nameMaxWidth, nameFontSize, nameColor, nameText, ctx)
      let priceY = this.autoSize(124) + vOffset + imgSize
      this.drawTextBold(margin + nameFontSize, priceY, `￥${parseInt(goodsOne.price||0)}`, nameFontSize * 1.2, 'black', ctx)


    },
    drawGoodsDetail: function drawGoodsDetail(ctx) {
      let vOffset = this.autoSize(290)
      let goodsOne = this.data.info.goods[0]
      let imgCount = goodsOne.paths.length
      let margin = this.data.widthPx * 0.05
      let width = (this.data.widthPx - margin * (imgCount + 1)) / imgCount
      let height = this.autoSize(318)
     
      for(let i=0;i<imgCount;i++){
        this.drawRoundImage(margin*(i+1) + i * width , vOffset, width, height, 8, goodsOne.paths[i], ctx)
      }
     
      
      let nameMarginTop = this.autoSize(40)
      let nameY = vOffset + height + nameMarginTop
      let nameFontSize = this.autoSize(30)
      let nameMaxWidth = this.data.widthPx - (nameFontSize + margin) * 2
      let nameText = goodsOne.name
      let nameColor = "#80848f"
      let textHeight =  this.drawTextLines(margin + nameFontSize, nameY, 2, nameMaxWidth, nameFontSize, nameColor, nameText, ctx)
      let priceY = nameY + textHeight + nameMarginTop
      this.drawTextBold(margin + nameFontSize, priceY, `￥${parseInt(goodsOne.price||0)}`, nameFontSize * 1.2, 'black', ctx)


    },
    drawShopQRCode: function drawShopQRCode(ctx) {

      let vOffset = this.autoSize(940)
      let imgSize = this.autoSize(155)
      let qrCodePath = this.data.info.code.path
      let startX = this.centerStartX([imgSize])
      ctx.drawImage(qrCodePath, startX, vOffset, imgSize, imgSize)
      let centerLogoSize = imgSize * 0.4465
      let centerLogoStartX = this.centerStartX([centerLogoSize])
      ctx.save()
      ctx.beginPath()
      ctx.arc(startX + imgSize / 2, vOffset + imgSize / 2, centerLogoSize / 2, 0, 2 * Math.PI)
      ctx.fill()
      ctx.clip()
      ctx.drawImage(this.data.info.shop.path, centerLogoStartX, vOffset + (imgSize - centerLogoSize) / 2, centerLogoSize, centerLogoSize)
      ctx.restore()

      let tipsMarginTop = this.autoSize(22)
      let tips = "长按识别即可看到商品"
      let tipsFontSize = this.autoSize(22)
      ctx.setFontSize(tipsFontSize)
      let tipsWidth = ctx.measureText(tips).width

      let tipsX = this.centerStartX([tipsWidth])
      ctx.setFillStyle("#80848f")
      ctx.fillText(tips, tipsX, vOffset + imgSize + tipsMarginTop)

    },

    autoSize: function autoSize(size) {
      // return size * this.data.widthPx / 675
      return size * this.data.heightPx / 1188
    },
    centerStartX: function centerStartX(dimens) {
      let viewsTotalWidth = dimens.reduce((prev, curr, idx, arr) => parseFloat(prev) + parseFloat(curr))
      return (this.data.widthPx - viewsTotalWidth) / 2
    },
    fillRoundRect: function fillRoundRect(x, y, width, height, r, ctx) {
      x = parseInt(x)
      y = parseInt(y)
      width = parseInt(width)
      height = parseInt(height)
      ctx.rect(x, y, width, height);
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + width - r, y);
      ctx.arc(x + width - r, y + r, r, Math.PI / 180 * 270, 0, false);
      ctx.lineTo(x + width, y + height - r);
      ctx.arc(x + width - r, y + height - r, r, 0, Math.PI / 180 * 90, 0, false);
      ctx.lineTo(x + r, y + height);
      ctx.arc(x + r, y + height - r, r, Math.PI / 180 * 90, Math.PI / 180 * 180, false);
      ctx.lineTo(x, y + r);
      ctx.arc(x + r, y + r, r, Math.PI / 180 * 180, Math.PI / 180 * 270, false);
      ctx.closePath()
      ctx.setFillStyle('#f7f7f7')
      ctx.fill()
    },
    drawRoundImage: function drawRoundImage(x, y, width, height, r, imgePath, ctx) {
      x = parseInt(x)
      y = parseInt(y)
      width = parseInt(width)
      height = parseInt(height)
      r = parseInt(r)
      ctx.save()
      ctx.rect(x, y, width, height);
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + width - r, y);
      ctx.arc(x + width - r, y + r, r, Math.PI / 180 * 270, 0, false);
      ctx.lineTo(x + width, y + height - r);
      ctx.arc(x + width - r, y + height - r, r, 0, Math.PI / 180 * 90, 0, false);
      ctx.lineTo(x + r, y + height);
      ctx.arc(x + r, y + height - r, r, Math.PI / 180 * 90, Math.PI / 180 * 180, false);
      ctx.lineTo(x, y + r);
      ctx.arc(x + r, y + r, r, Math.PI / 180 * 180, Math.PI / 180 * 270, false);
      ctx.closePath()
      ctx.clip()
      console.log(`width is ${width} height is ${height}`)
      // let scaleHeight = 798 * height / width   //以宽度适配高度 并居中
      // ctx.drawImage(imgePath, 0, (792 - scaleHeight) / 2, 798, scaleHeight,x, y, width, height)
      ctx.drawImage(imgePath, x, y, width, height)
      ctx.restore()
    },
    singleLine: function singleLine(text, maxWidth, fontSize, ctx, ellipsis = true) {
      ctx.setFontSize(fontSize)
      if (ctx.measureText(text).width <= maxWidth) { //没有超出
        return text
      }
      var chars = text.split("")
      while (ctx.measureText(chars.join('')).width > maxWidth) {
        chars.pop()
      }
      return `${chars.join('')}${ellipsis?'...':''}`
    },
    drawTextLines: function drawTextLines(x, y, maxLines, maxWidth, fontSize, color, text, ctx) {
      ctx.setFontSize(fontSize)
      ctx.setFillStyle(color)
      // ctx.setTextBaseline('top')
      let offset = 0
      let height = fontSize
      while (maxLines-- > 0 && text.length > 0) {
        let singleLine = this.singleLine(text, maxWidth, fontSize, ctx, false)
        if (singleLine.length > 0) {
          let end = singleLine == text.substring(text.length - singleLine.length)
          ctx.fillText(`${singleLine}${(maxLines == 0 &&!end )?'...':''}`, x, y + offset)
          height = fontSize + offset
        }
        text = text.substring(singleLine.length)
        offset += fontSize * 1.5
      }
      return height
    },

    drawTextBold: function drawTextBold(x, y, text, fontSize, color, ctx) {
      ctx.font = `normal bold 20px unset`
      ctx.setFontSize(fontSize)
      ctx.setFillStyle('black')
      ctx.fillText(text, x, y)
    },
    drawShopBottom: function drawShopBottom(ctx) {

      let desFontSize = this.autoSize(20)
      let desRectWidth = this.autoSize(575) //575
      let desRectHeight = this.autoSize(60)
      let desRectX = this.centerStartX([desRectWidth])
      let desRectY = this.autoSize(820)
      let r = desRectHeight / 5

      ctx.setFillStyle('#f7f7f7')
      this.fillRoundRect(desRectX, desRectY, desRectWidth, desRectHeight, r, ctx)

      let iconSize = this.autoSize(28)
      ctx.setFontSize(desFontSize)
      let textWidth = ctx.measureText('正品担保').width //文字总宽度，后面要根据内容动态改变
      let iconMarginRight = 2 //图标右间距
      let gap = iconSize * 2 //项目水平间距
      let contentWidth = (textWidth + iconSize + iconMarginRight) * 3 + gap * 2
      let startX = this.centerStartX([contentWidth])
      let iconAssurance = "../../icon/ic_assurance.png"
      let textAssurance = "正品担保"
      let iconY = desRectY + (desRectHeight - iconSize) / 2

      ctx.drawImage(iconAssurance, startX, iconY, iconSize, iconSize)
      ctx.setFillStyle('#80848f')
      ctx.textBaseline = 'middle'
      ctx.setFontSize(this.autoSize(20))
      startX += (iconSize + iconMarginRight)
      ctx.fillText(textAssurance, startX, desRectY + desRectHeight / 2)

      let iconFree = "../../icon/ic_price.png"
      let textFree = "限时包邮"
      startX += (gap + textWidth)
      ctx.drawImage(iconFree, startX, iconY, iconSize, iconSize)
      startX += iconSize + iconMarginRight
      ctx.fillText(textFree, startX, desRectY + desRectHeight / 2)
      startX += (textWidth + gap)
      let iconLeague = "../../icon/ic_league.png"
      let textLeague = "优品联盟"
      ctx.drawImage(iconLeague, startX, iconY, iconSize, iconSize)
      startX += iconSize + iconMarginRight
      ctx.fillText(textLeague, startX, desRectY + desRectHeight / 2)
    },

  }
});



// wx.downloadFile({
//   url: 'http://is5.mzstatic.com/image/thumb/Purple128/v4/75/3b/90/753b907c-b7fb-5877-215a-759bd73691a4/source/50x50bb.jpg',
//   success: function (res) {
//     ctx.save()
//     ctx.beginPath()
//     ctx.arc(50, 50, 25, 0, 2 * Math.PI)
//     ctx.clip()
//     ctx.drawImage(res.tempFilePath, 25, 25)
//     ctx.restore()
//     ctx.draw()
//   }
// })