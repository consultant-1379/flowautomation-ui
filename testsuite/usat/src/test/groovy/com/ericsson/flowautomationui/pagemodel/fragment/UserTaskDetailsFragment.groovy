package com.ericsson.flowautomationui.pagemodel.fragment

import org.openqa.selenium.By
import org.openqa.selenium.Keys
import org.openqa.selenium.WebElement
import org.openqa.selenium.support.FindBy

class UserTaskDetailsFragment extends BaseFragment {

    @FindBy(className = "eaFlowInstanceDetails-wUserTaskForm-header-title")
    private WebElement userTaskTitle

    @FindBy(className = "eaFlowInstanceDetails-wUserTaskForm-form")
    private WebElement userTaskForm

    @FindBy(className = "eaFlowInstanceDetails-wInteger-label")
    private WebElement integerLabel

    @FindBy(className = "eaFlowInstanceDetails-rUserTasks-userTaskList-header")
    private WebElement userTaskHeader

    //setup phase
    @FindBy(className = "eaFlowInstanceDetails-wChoice-input")
    private List<WebElement> radios

    @FindBy(className = "eaFlowInstanceDetails-wText-content-value")
    private List<WebElement> textFields

    @FindBy(className = "eaFlowInstanceDetails-wText-error")
    private List<WebElement> textErrorFields

    @FindBy(className = "eaFlowInstanceDetails-wUserTaskForm-header-error-message")
    private WebElement errorMessage

    @FindBy(className = "ebLabel-text")
    private List<WebElement> inputLabels

    @FindBy(className = "ebAccordion-title")
    private List<WebElement> accordions

    @FindBy(className = "eaFlowInstanceDetails-wLabel-content-label")
    private List<WebElement> labelName

    @FindBy(className = "eaFlowInstanceDetails-wChoice-label")
    private List<WebElement> radiosContentNames

    @FindBy(className = "eaFlowInstanceDetails-wFileSelector-textBox-fileName")
    private WebElement fileName

    @FindBy(className = "eaFlowInstanceDetails-wText-content-label")
    private List<WebElement> textName

    @FindBy(className = "ebCheckbox")
    private List<WebElement> checkBoxes

    @FindBy(className = "ebCheckbox-label")
    private List<WebElement> checkBoxLabels

    @FindBy(className = "eaFlowInstanceDetails-wSelectBox-label-holder")
    private WebElement selectBoxLabel

    @FindBy(className = "ebSelect-header")
    private WebElement selectBox

    @FindBy(className = "ebComponentList-item")
    private List<WebElement> selectBoxItems

    @FindBy(className = "ebSelect-value")
    private WebElement selectBoxValue

    @FindBy(className = "ebSelect-value")
    private List<WebElement> selectBoxValues

    @FindBy(className = "eaFlowInstanceDetails-wLabel-inner")
    private List<WebElement> innerLabels

    @FindBy(className = "ebSpinner-input")
    private WebElement spinnerInput

    @FindBy(css = ".eaFlowInstanceDetails-wListBox-listBox .elTablelib-Table")
    private List<TableFragment> listBoxes

    @FindBy(className = "eaFlowInstanceDetails-wPopupTable")
    private List<WebElement> infoTables

    @FindBy(className = "eaFlowInstanceDetails-wPopupTableButton")
    private List<WebElement> selectTables

    @FindBy(className = "eaFlowInstanceDetails-wMessage")
    private List<WebElement> messages

    def getSpinnerValue() {
        return waitVisible(spinnerInput).getAttribute("value").toInteger()
    }

    def getListBoxSelectedValue() {
        return getText(listBoxes[0].selectedRow.rowCells[0])
    }

    def selectListItem() {
        listBoxes[0].getAllTableBodyRows().first().clickRow()
    }

    def getInformationalList() {
        return listBoxes[2].allTableBodyRows.size()
    }

    String getSelectBoxLabel() {
        return getText(selectBoxLabel)
    }

    String getSelectBoxValue() {
        return getText(selectBoxValue)
    }

    def clickSelectBox() {
        click(selectBox)
        return true
    }

    def selectItemFromDropDown(itemName) {
        for (item in selectBoxItems) {
            if (item.text == itemName) {
                item.click()
                return true
            }
        }
    }

    def isWidgetRevealed(webElements, labelText) {
        for (element in webElements) {
            if (element.getText().equals(labelText)) {
                return true
            }
        }
        return false
    }

    def isLabelWidgetRevealed(labelText) {
        return isWidgetRevealed(labelName, labelText)
    }

    def isCheckBoxWidgetRevealed(labelText) {
        return isWidgetRevealed(radiosContentNames, labelText)
    }

    def isTextWidgetRevealed(labelText) {
        return isWidgetRevealed(textName, labelText)
    }

    def isSelectBoxWidgetRevealed(labelText) {
        return isWidgetRevealed(selectBoxValues, labelText)
    }

    def clickCheckBoxWithLabel(checkBoxLabel) {
        for (item in getCheckBoxes()) {
            if (item.getAttribute("value") == checkBoxLabel) {
                item.click()
                return true
            }
        }
    }

    List<WebElement> getCheckBoxes() {
        return checkBoxes
    }

    List<WebElement> getCheckBoxLabels() {
        return checkBoxLabels
    }

    String getCheckBoxLabel(int index) {
        return getText(checkBoxLabels.get(index))
    }

    def isFileInputVisible() {
        waitVisible(fileName)
    }

    def isFileInputNotVisible() {
        waitNotVisible(fileName)
    }

    String getContentName(int index) {
        return getText(radiosContentNames.get(index))
    }

    List<WebElement> getRadios() {
        return radios
    }

    List<WebElement> getTextFields() {
        return textFields
    }

    String getUserTaskTitle() {
        return getText(userTaskTitle)
    }

    String getIntegerLabel() {
        return getText(integerLabel)
    }

    String getUserTaskHeader() {
        return getText(userTaskHeader)
    }

    def getAccordionTitle(index) {
        return accordions.get(index).text.trim()
    }

    def getLabelValue(index) {
        return innerLabels.get(index).findElement(By.className("eaFlowInstanceDetails-wLabel-content-value")).text.trim()
    }

    def isLabelValueTrue(index) {
        return waitVisible(innerLabels.get(index).findElement(By.className("eaFlowInstanceDetails-wLabel-content-icon-true")))
    }

    def isLabelValueFalse(index) {
        return waitVisible(innerLabels.get(index).findElement(By.className("eaFlowInstanceDetails-wLabel-content-icon-false")))
    }

    String getLabelName(int index) {
        return getText(labelName.get(index))
    }

    String getTextName(int index) {
        return getText(textName.get(index))
    }

    void clickRadio(int index) {
        getRadios().get(index).click()
    }

    void clickCheckBox() {
        for (int i = 0; i < checkBoxes.size(); i++) {
            def checkBox = getCheckBoxes().get(i)
            checkBox.click()
        }
    }

    void setFieldText(int index, final String value) {
        getTextFields().get(index).sendKeys(value)
    }

    void deleteCharsAndSetFieldText(int index, final String value, final int charsToDelete) {
        def i = charsToDelete
        while (i > 0) {
            getTextFields().get(index).sendKeys(".", Keys.BACK_SPACE, Keys.BACK_SPACE)
            i--
        }
        getTextFields().get(index).sendKeys(value)
    }

    String getErrorText(int index) {
        return textErrorFields.get(index).getText()
    }

    String getErrorMessageText() {
        return errorMessage.getText()
    }

    String getLabelDescription(int index) {
        return getText(inputLabels.get(index))
    }

    boolean checkIfAllOtherRadioButtonsAreNotSelected(index) {
        def result
        for (int i = 0; i < radios.size(); i++) {
            if (i == index) {
                result = radios.get(i).isSelected()
            } else {
                result = !radios.get(i).isSelected()
            }
        }
        return result
    }

    boolean checkIfAllOtherCheckboxesAreNotSelected(index1, index2) {
        def result
        for (int i = 0; i < checkBoxes.size(); i++) {
            if (i == index1) {
                result = checkBoxes.get(i).isSelected()
            } else if (i == index2) {
                result = checkBoxes.get(i).isSelected()
            } else {
                result = !checkBoxes.get(i).isSelected()
            }
        }
        return result
    }

    def getUserTaskFormWidth() {
        return userTaskForm.size.width
    }

    WebElement getInfoTable(index) {
        return infoTables.get(index)
    }

    int getInfoTablesCount() {
        return infoTables.size()
    }

    def isInfoTableVisible(index) {
        waitVisible(getInfoTable(index))
    }

    String getInfoTableTitle(index) {
        return getInfoTable(index).findElement(By.className("eaFlowInstanceDetails-wPopupTable-container-topPanel-header-text")).text.trim()
    }

    def getInfoTableWidth(index) {
        return getInfoTable(index).size.width
    }

    def getInfoTableContainerWidth(index) {
        return getInfoTable(index).findElement(By.className("eaFlowInstanceDetails-wPopupTable-container")).size.width
    }

    WebElement getInfoTableHeader(index) {
        return getInfoTable(index).findElement(org.openqa.selenium.By.className("elTablelib-Table-header"))
    }

    def getInfoTableHeaderWidth(index) {
        return getInfoTableHeader(index).size.width
    }

    List<WebElement> getInfoTableColumns(index) {
        return getInfoTableHeader(index).findElements(org.openqa.selenium.By.className("ebTableCell"))
    }

    WebElement getInfoTableColumn(index, columnIndex) {
        return getInfoTableColumns(index).get(columnIndex)
    }

    def getInfoTableColumnWidth(index, columnIndex) {
        return getInfoTableColumn(index, columnIndex).size.width
    }

    int getSelectTablesCount() {
        return selectTables.size()
    }

    WebElement getSelectTable(index) {
        return selectTables.get(index)
    }

    String getSelectTableTitle(index) {
        return getSelectTable(index).findElement(By.className("eaFlowInstanceDetails-wPopupTableButton-header-title")).text.trim()
    }

    def getSelectTableHeaderButton(index) {
        return getSelectTable(index).findElement(By.className("eaFlowInstanceDetails-wPopupTableButton-header-button"))
    }

    def getSelectTableButton(index) {
        return getSelectTableHeaderButton(index).findElement(By.className("ebBtn"))
    }

    def isSelectedItemsLabelVisible(index) {
        return waitVisible(getSelectTable(index).findElement(By.className("eaFlowInstanceDetails-wPopupTableButton-header-selectedValue")))
    }

    def isSelectedItemsLabelHidden(index) {
        return waitNotVisible(getSelectTable(index).findElement(By.className("eaFlowInstanceDetails-wPopupTableButton-header-selectedValue")))
    }

    String getMessageName(int index) {
        return getText(messages.get(index).findElement(By.className("ebInlineMessage-header")))
    }

    String getMessageDescription(int index) {
        return getText(messages.get(index).findElement(By.className("ebInlineMessage-description")))
    }

    def isMessageError(int index) {
        return waitVisible(messages.get(index).findElement(By.className("ebIcon_error")))
    }

    def isMessageWarning(int index) {
        return waitVisible(messages.get(index).findElement(By.className("ebIcon_warning")))
    }

    def isMessageInfo(int index) {
        return waitVisible(messages.get(index).findElement(By.className("ebIcon_infoMsgIndicator")))
    }
}