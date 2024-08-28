package com.ericsson.flowautomationui.spec.InstanceDetails

import com.ericsson.flowautomationui.pagemodel.fragment.*
import com.ericsson.flowautomationui.pagemodel.page.InstanceDetailsPage
import com.ericsson.flowautomationui.pagemodel.page.InstancesPage
import com.ericsson.flowautomationui.spec.BaseSpecification
import org.jboss.arquillian.graphene.page.Page
import org.jboss.arquillian.spock.ArquillianSputnik
import org.junit.runner.RunWith
import org.openqa.selenium.support.FindBy

import static com.ericsson.flowautomationui.utils.FlowAutomationConstants.*

@RunWith(ArquillianSputnik)
class InstanceDetailsUserTasksSpec extends BaseSpecification {

    public static final String EXECUTE_BUTTON = "Execute"
    public static final int INDENT_WIDTH = 28;
    public static final int USER_TASK_FORM_OVERLOAD_WIDTH = 30;
    public static final int COLUMN_MIN_WIDTH = 60;

    @Page
    InstancesPage instancesPage

    @Page
    InstanceDetailsPage instanceDetailsPage

    @Page
    UserTaskDetailsFragment userTaskDetailsFragment

    @Page
    StartInstanceDialogFragment dialogFragment

    @FindBy(className = "eaFlowInstanceDetails-wActionPanel-content")
    UserTaskDetailsButtonsFragment userTaskDetailsButtonsFragment

    def "test if you can get to flow instance details"() {
        setup: "flow automation is running"
        openFlowAutomationUrl()
        instancesPage.isTopsectionVisible()
        instancesPage.verifyTopSectionTitle(InstancesPage.TITLE)

        when: "unselect my flow instances"
        instancesPage.clickMyInstances()

        then: "when table is visible"
        instancesPage.instancesTableFragment.getTable()

        when: "double click on an instance in the table"
        instancesPage.instancesTableFragment.dblClickRow(driver, "mock-setup")

        then: "Verify top section"
        instancesPage.verifyTopSectionTitle("Flow Instance Details")

        and: "Verify flow instance details summary section"
        def flowInstanceDetailsSummaryHeaderFragment = instanceDetailsPage.flowInstanceDetailsSummaryHeaderFragment
        flowInstanceDetailsSummaryHeaderFragment.name == "mock-setup"
        flowInstanceDetailsSummaryHeaderFragment.flow == "Flow with user task schema"
        flowInstanceDetailsSummaryHeaderFragment.version == "1.0.11"

        def flowInstanceDetailsSummaryFragment = instanceDetailsPage.flowInstanceDetailsSummaryFragment
        flowInstanceDetailsSummaryFragment.summaryState == "Setup"
        flowInstanceDetailsSummaryFragment.startTime.contains("2018-11-01")
        flowInstanceDetailsSummaryFragment.endTime == "N/A"
        flowInstanceDetailsSummaryFragment.startedBy == "administrator"
        flowInstanceDetailsSummaryFragment.result != "229"
    }

    def "test Action-Bar Restart"() {
        when: "click on restart button"
        instanceDetailsPage.flowInstanceDetailsSummaryFragment.summaryState == "Setup"
        instanceDetailsPage.clickActionBar("Restart")

        then: "verify restart dialogue"
        instanceDetailsPage.dialogFragment.getDialogBoxHeading() == "Restart"
        instanceDetailsPage.dialogFragment.getSecondaryText() == "Are you sure you want to restart this flow instance?"

        when: "click in cancel"
        instanceDetailsPage.dialogFragment.clickActionButton(CANCEL)

        then: "dialog is no longer visible"
        instanceDetailsPage.dialogFragment.doesExist()
    }

    def "test Action-Bar Discard"() {
        when: "click on discard button"
        instanceDetailsPage.flowInstanceDetailsSummaryFragment.summaryState == "Setup"
        instanceDetailsPage.clickActionBar("Discard Setup")


        then: "verify discard dialogue"
        instanceDetailsPage.dialogFragment.getDialogBoxHeading() == "Discard Setup"
        instanceDetailsPage.dialogFragment.getSecondaryText() == "Are you sure you want to discard the setup of this flow instance?"

        when: "click in cancel"
        instanceDetailsPage.dialogFragment.clickActionButton(CANCEL)

        then: "dialog is no longer visible"
        instanceDetailsPage.dialogFragment.doesExist()
    }

    def "test Task: Choose Setup"() {
        when:
        userTaskDetailsFragment.clickRadio(0)

        then: "verify title Task: Choose Setup"
        userTaskDetailsFragment.getUserTaskTitle() == "Task: Choose Setup"

        and: "verify set up elements are visible"
        //TODO uncomment this when server side set up schema is updated
        // userTaskDetailsFragment.description == "Choose the Choose Setup that best suits your needs")
        userTaskDetailsFragment.getContentName(0) == "Interactive"
        userTaskDetailsFragment.getContentName(1) == "File Input"
        userTaskDetailsFragment.isFileInputNotVisible()

        when:
        userTaskDetailsFragment.clickRadio(1)

        then:
        userTaskDetailsFragment.isFileInputVisible()

        and:
        userTaskDetailsButtonsFragment.verifyNameFirstButton(CONTINUE)

        when: "no file is selected and continue is pressed"
        userTaskDetailsButtonsFragment.clickUserTaskButton(CONTINUE)
        instancesPage.isDialogBoxDisplayed()
        def importFlowDialogFragment = instancesPage.importFlowDialogFragment

        then: "Verify the header of dialog box is correct "
        importFlowDialogFragment.getDialogBoxHeading() == USER_TASK_JSON_NO_INPUT_ERROR
        importFlowDialogFragment.clickActionButton(OK)

        when: "a file has been selected"
        instancesPage.selectFile(driver, "GAT-flow-package.zip")

        and: "click the continue button"
        userTaskDetailsButtonsFragment.clickUserTaskButton(CONTINUE)

        then: "Verify the header of dialog box is correct"
        instancesPage.isDialogBoxDisplayed()
        importFlowDialogFragment.getDialogBoxHeading() == USER_TASK_JSON_PROCESSING_ERROR
        importFlowDialogFragment.clickActionButton(OK)

        and: "click the continue button"
        userTaskDetailsButtonsFragment.clickUserTaskButton(CONTINUE)

        then: "Verify the usertask inline error message is set when a flow throws an exception having error code starting with error.fa"
        userTaskDetailsFragment.getErrorMessageText() == "The value should be between 100-200"

        then: "click on continue"
        userTaskDetailsButtonsFragment.clickUserTaskButton(CONTINUE)
    }

    def "test task: User Task Selection"() {
        when: "verify title Task: User Task Selection"
        userTaskDetailsFragment.getUserTaskTitle() == "Task: User Task Selection"

        then: "verify there are 10 check boxes with labels"
        userTaskDetailsFragment.getCheckBoxes().size() == 11
        userTaskDetailsFragment.getCheckBoxLabel(0) == "Information"
        userTaskDetailsFragment.getCheckBoxLabel(1) == "Text Inputs"
        userTaskDetailsFragment.getCheckBoxLabel(2) == "Text Inputs With Information"
        userTaskDetailsFragment.getCheckBoxLabel(3) == "Checkboxes"
        userTaskDetailsFragment.getCheckBoxLabel(4) == "Radio Buttons"
        userTaskDetailsFragment.getCheckBoxLabel(5) == "Selectboxes"
        userTaskDetailsFragment.getCheckBoxLabel(6) == "Tables"
        userTaskDetailsFragment.getCheckBoxLabel(7) == "File Selectors"
        userTaskDetailsFragment.getCheckBoxLabel(8) == "Grouping And Nesting"
        userTaskDetailsFragment.getCheckBoxLabel(9) == "Checkboxes With Nesting"
        userTaskDetailsFragment.getCheckBoxLabel(10) == "Radio Buttons With Nesting"

        and: "click on the checkBoxes"
        for (checkBox in userTaskDetailsFragment.getCheckBoxes()) {
            checkBox.click()
        }
        //TODO modify mockServer to check the response object

        then: "click on continue"
        scrollEnd()
        userTaskDetailsButtonsFragment.clickUserTaskButton(CONTINUE)
    }

    def "test task: Information"() {
        when: "verify title Task: Text inputs"
        userTaskDetailsFragment.getUserTaskTitle() == "Task: Information"

        and: "verify content"
        userTaskDetailsFragment.getLabelDescription(0) == "This is short information."
        userTaskDetailsFragment.getLabelDescription(1) == "This is long information. This is long information. This is long information. This is long information. This is long information. This is long information. This is long information. This is long information."
        userTaskDetailsFragment.isMessageError(0)
        userTaskDetailsFragment.getMessageName(0) == "This is an error message. It is here to let the user know what to not do while filling out the page."
        userTaskDetailsFragment.isMessageWarning(1)
        userTaskDetailsFragment.getMessageName(1) == "This is a warning message. It is here to make the user aware of consequences of some choices while filling out the page."
        userTaskDetailsFragment.isMessageInfo(2)
        userTaskDetailsFragment.getMessageName(2) == "This is an info message. It is here to provide the user with some extra info while filling out the page."

        then: "click on continue"
        scrollEnd()
        userTaskDetailsButtonsFragment.clickUserTaskButton(CONTINUE)
    }

    def "test task: Text Inputs"() {
        when: "verify title Task: Text inputs"
        userTaskDetailsFragment.getUserTaskTitle() == "Task: Text inputs"

        then: "verify the different labels and input text into the field"
        userTaskDetailsFragment.getErrorMessageText() == ""
        userTaskDetailsFragment.getLabelDescription(0) == "Text input with no length restrictions"
        userTaskDetailsFragment.getLabelDescription(1) == "Short text input"
        userTaskDetailsFragment.getLabelDescription(2) == "Medium text input"
        userTaskDetailsFragment.getErrorMessageText() == ""
        userTaskDetailsFragment.isMessageInfo(0)
        userTaskDetailsFragment.getMessageName(0) == "This is a extremely long info message. This is a extremely long info message. This is a extremely long info message. This is a extremely long info message. This is a extremely long info message. This is a extremely long info message. This is a extremely long info message."
        userTaskDetailsFragment.getMessageDescription(0) == "This is the message description, to provide the user with some extra details."

        when: "click continue"
        scrollEnd()
        userTaskDetailsButtonsFragment.clickUserTaskButton(CONTINUE)

        then: "Verify correct error messages are produced"
        userTaskDetailsFragment.getLabelDescription(2) == "Medium text input"
        userTaskDetailsFragment.getErrorMessageText() == "5 validation error(s), please fix these before proceeding"
        userTaskDetailsFragment.deleteCharsAndSetFieldText(1, "12345678912", 0)
        userTaskDetailsFragment.getErrorText(0) == "This input is required."
        userTaskDetailsFragment.getErrorText(1) == "This input must have a maximum length of 10 characters."
        userTaskDetailsFragment.getErrorText(2) == "This input is required with a minimum length of 4 characters."
        userTaskDetailsFragment.getErrorText(3) == "This input is required with a minimum length of 4 characters."
        userTaskDetailsFragment.getErrorText(4) == "This input is required with a minimum length of 4 characters."
        userTaskDetailsFragment.deleteCharsAndSetFieldText(6, "123", 10)
        userTaskDetailsFragment.getErrorMessageText() == "6 validation error(s), please fix these before proceeding"
        userTaskDetailsFragment.deleteCharsAndSetFieldText(1, "1234", 11)
        userTaskDetailsFragment.deleteCharsAndSetFieldText(6, "1234", 10)
        userTaskDetailsFragment.getErrorMessageText() == "4 validation error(s), please fix these before proceeding"
        sleep(5000)
        userTaskDetailsFragment.deleteCharsAndSetFieldText(0, "This is a long string to test the input in the text field", 0)
        userTaskDetailsFragment.deleteCharsAndSetFieldText(1, "Flow", 0)
        userTaskDetailsFragment.deleteCharsAndSetFieldText(2, "Automation", 0)
        userTaskDetailsFragment.deleteCharsAndSetFieldText(3, "Text", 0)
        userTaskDetailsFragment.deleteCharsAndSetFieldText(4, "Inputs", 0)
        userTaskDetailsFragment.getErrorMessageText() == ""
        userTaskDetailsFragment.deleteCharsAndSetFieldText(4, "%%%%%%%%", 10)
        userTaskDetailsFragment.getErrorMessageText() == ""
        userTaskDetailsFragment.getErrorText(4) == "Must match the pattern : [a-z]+"
        userTaskDetailsFragment.deleteCharsAndSetFieldText(4, "abcd", 10)
        userTaskDetailsFragment.getErrorMessageText() == ""
        userTaskDetailsFragment.getErrorText(0) == ""
        userTaskDetailsFragment.getErrorText(1) == ""
        userTaskDetailsFragment.getErrorText(2) == ""
        userTaskDetailsFragment.getErrorText(3) == ""
        userTaskDetailsFragment.getErrorText(4) == ""
        userTaskDetailsFragment.getErrorText(5) == ""
        userTaskDetailsFragment.getErrorText(6) == ""
        //TODO modify mockServer to check the response object

        then: "click on continue"
        scrollEnd()
        userTaskDetailsButtonsFragment.clickUserTaskButton(CONTINUE)
    }

    def "test task: Number Inputs"() {
        when: "verify title Task: Number inputs"
        userTaskDetailsFragment.getUserTaskTitle() == "Task: Number inputs"

        then: "verify spinner label"
        userTaskDetailsFragment.integerLabel == "Number of copies"

        then: "verify spinner value"
        userTaskDetailsFragment.getSpinnerValue() == 4

        then: "click on continue"
        userTaskDetailsButtonsFragment.clickUserTaskButton(CONTINUE)
    }

    def "test task: Select boxes"() {
        when: "verify title Task: Select boxes"
        userTaskDetailsFragment.getUserTaskTitle() == "Task: Select boxes"

        and: "verify selectBox label"
        userTaskDetailsFragment.selectBoxLabel == "Select box label"

        and: "verify default option in select box"
        userTaskDetailsFragment.selectBoxValue == "Short contents"

        then: "click selectBox"
        userTaskDetailsFragment.clickSelectBox()

        and: "select an item from the dropdown"
        userTaskDetailsFragment.selectItemFromDropDown("Long contents Long contents Long contents Long contents Long contents Long contents")

        and: "verify selection in select box"
        userTaskDetailsFragment.selectBoxValue == "Long contents Long contents Long contents Long contents Long contents Long contents"
        //TODO modify mockServer to check the response object

        then: "click on continue"
        userTaskDetailsButtonsFragment.clickUserTaskButton(CONTINUE)
    }

    def "test task: ListBoxes"() {
        when: "verify title Task: Select boxes"
        userTaskDetailsFragment.getUserTaskTitle() == "Task: List boxes"

        then: "verify default option in select box"
        userTaskDetailsFragment.getListBoxSelectedValue() == "Short contents"

        and: "verifiy informational list"
        userTaskDetailsFragment.getInformationalList() == 4

        when: "select an item from the list"
        userTaskDetailsFragment.selectListItem()

        then: "verify selection in select box"
        userTaskDetailsFragment.getListBoxSelectedValue() == "Long contents Long contents Long contents Long contents Long contents Long contents"
        //TODO modify mockServer to check the response object

        and: "click on continue"
        scrollEnd()
        userTaskDetailsButtonsFragment.clickUserTaskButton(CONTINUE)
    }

    def "test task: Tables"() {
        when: "verify title Task: Tables"
        userTaskDetailsFragment.getUserTaskTitle() == "Task: Tables"

        and: "last informational table is made visible by clicking the radio button"
        userTaskDetailsFragment.clickRadio(1)
        userTaskDetailsFragment.isInfoTableVisible(5)

        then: "verify there are 6 informational tables"
        userTaskDetailsFragment.getInfoTablesCount() == 6

        and: "verify informational tables features"
        def entryList = [
            [tableIndex: 0, tableTitle: "InformationalTable", indentLevel: 0, columnsNumber: 7],
            [tableIndex: 1, tableTitle: "InformationalTable2Cols", indentLevel: 0, columnsNumber: 2],
            [tableIndex: 2, tableTitle: "InformationalTable20Cols", indentLevel: 0, columnsNumber: 20],
            [tableIndex: 3, tableTitle: "Packages", indentLevel: 2, columnsNumber: 7],
            [tableIndex: 4, tableTitle: "Packages", indentLevel: 2, columnsNumber: 7],
            [tableIndex: 5, tableTitle: "InformationalTableNested", indentLevel: 1, columnsNumber: 7]
        ]
        for (entry in entryList) {
            userTaskDetailsFragment.getInfoTableTitle(entry.tableIndex) == entry.tableTitle
            userTaskDetailsFragment.getInfoTableContainerWidth(entry.tableIndex) == userTaskDetailsFragment.getInfoTableWidth(entry.tableIndex) - entry.indentLevel * INDENT_WIDTH
            int calcColumnWidth = Math.floor((userTaskDetailsFragment.getUserTaskFormWidth() - USER_TASK_FORM_OVERLOAD_WIDTH) / entry.columnsNumber)
            if (calcColumnWidth < COLUMN_MIN_WIDTH) {
                userTaskDetailsFragment.getInfoTableColumnWidth(entry.tableIndex, 0) == COLUMN_MIN_WIDTH
                userTaskDetailsFragment.getInfoTableHeaderWidth(entry.tableIndex) == COLUMN_MIN_WIDTH * entry.columnsNumber
            } else {
                userTaskDetailsFragment.getInfoTableColumnWidth(entry.tableIndex, 0) == calcColumnWidth
                userTaskDetailsFragment.getInfoTableHeaderWidth(entry.tableIndex) < userTaskDetailsFragment.getInfoTableContainerWidth(entry.tableIndex)
            }
        }

        when: "verify there is 1 select table"
        userTaskDetailsFragment.getSelectTablesCount() == 1

        and: "its title is 'SingleSelectableTable'"
        userTaskDetailsFragment.getSelectTableTitle(0) == 'SingleSelectableTable'

        and: "verify 'Selected Items:' label is hidden"
        userTaskDetailsFragment.isSelectedItemsLabelHidden(0)

        and: "the user opens the select dialog box"
        scrollToElement(userTaskDetailsFragment.getSelectTable(0))
        userTaskDetailsFragment.getSelectTableButton(0).click()
        instanceDetailsPage.isDialogBoxDisplayed()
        instanceDetailsPage.isErrorOnDialogBoxHidden()

        and: "the user selects and deselects the first row, then clicks on OK button"
        instanceDetailsPage.selectAndDeselectFirstRowOnDialogBox()
        instanceDetailsPage.getOkButtonOnDialogBox().click()

        then: "validation fails"
        instanceDetailsPage.isErrorOnDialogBoxShown()

        when: "the user selects a row and clicks on OK button"
        instanceDetailsPage.selectFirstRowOnDialogBox()
        instanceDetailsPage.getOkButtonOnDialogBox().click()

        then: "verify 'Selected Items:' label is now visible"
        userTaskDetailsFragment.isSelectedItemsLabelVisible(0)

        and: "click on continue"
        scrollEnd()
        userTaskDetailsButtonsFragment.clickUserTaskButton(CONTINUE)
    }

    def "test task: Radio Buttons"() {
        when: "verify title Task: Radio Buttons"
        userTaskDetailsFragment.getUserTaskTitle() == "Task: Radio Buttons"

        then: "verify default option in radio button"
        userTaskDetailsFragment.getContentName(0) == "Short label"

        and: "verify no other radio button is selected except the default option"
        userTaskDetailsFragment.checkIfAllOtherRadioButtonsAreNotSelected(0)

        when: "click a different radio button option"
        userTaskDetailsFragment.clickRadio(1)

        then: "verify selection in radio button"
        userTaskDetailsFragment.getContentName(1) == "FA"

        and: "verify no other radio button is selected except the second one"
        userTaskDetailsFragment.checkIfAllOtherRadioButtonsAreNotSelected(1)

        when: "click a different radio button option"
        userTaskDetailsFragment.clickRadio(2)

        then: "verify selection in radio button"
        userTaskDetailsFragment.getContentName(2) == "Medium Sized label"

        and: "verify no other radio button is selected except the third one"
        userTaskDetailsFragment.checkIfAllOtherRadioButtonsAreNotSelected(2)

        when: "click a different radio button option"
        userTaskDetailsFragment.clickRadio(3)

        then: "verify selection in radio button"
        userTaskDetailsFragment.getContentName(3) == "Long label long label long label long label"

        and: "verify no other radio button is selected except the fourth one"
        userTaskDetailsFragment.checkIfAllOtherRadioButtonsAreNotSelected(3)

        when: "click a different radio button option"
        userTaskDetailsFragment.clickRadio(0)

        then: "verify selection in radio button"
        userTaskDetailsFragment.getContentName(0) == "Short label"

        and: "verify no other radio button is selected except the default one"
        userTaskDetailsFragment.checkIfAllOtherRadioButtonsAreNotSelected(0)

        then: "click on continue"
        userTaskDetailsButtonsFragment.clickUserTaskButton(CONTINUE)
    }

    def "test task: Radio Buttons with nesting"() {
        when: "verify title Task: Radio Buttons"
        userTaskDetailsFragment.getUserTaskTitle() == "Task: Radio Buttons With Nesting"

        then: "click the first radio button"
        userTaskDetailsFragment.clickRadio(0)

        then: "verify a label widget is revealed"
        userTaskDetailsFragment.isLabelWidgetRevealed("This is short information.")

        when: "click the inner radio button"
        userTaskDetailsFragment.clickRadio(1)

        then: "verify a label widget is revealed"
        userTaskDetailsFragment.isLabelWidgetRevealed("This is short information 1.")

        when: "click the second inner radio button"
        userTaskDetailsFragment.clickRadio(2)

        then: "verify a label widget is revealed"
        userTaskDetailsFragment.isLabelWidgetRevealed("This is short information 2.")

        when: "click the second outer radio button"
        userTaskDetailsFragment.clickRadio(3)

        then: "verify one text widget is revealed"
        userTaskDetailsFragment.isTextWidgetRevealed("Text Input 1")

        when: "click the third radio button"
        userTaskDetailsFragment.clickRadio(4)

        then: "verify a select widget are revealed"
        userTaskDetailsFragment.isSelectBoxWidgetRevealed("Short contents")

        when: "click the fourth radio button"
        userTaskDetailsFragment.clickRadio(5)

        then: "verify two checkBox widget are revealed"
        userTaskDetailsFragment.isCheckBoxWidgetRevealed("Medium Sized label")
        userTaskDetailsFragment.isCheckBoxWidgetRevealed("Long label long label long label long label")

        when: "click the fifth radio button"
        userTaskDetailsFragment.clickRadio(8)

        then: "verify nested checkBox widget is revealed"
        userTaskDetailsFragment.isCheckBoxWidgetRevealed("Checkbox exposes more detail")
        then: "click checkBox and verify selectBox widget is revealed"
        userTaskDetailsFragment.clickCheckBoxWithLabel("Checkbox exposes more detail")
        userTaskDetailsFragment.isSelectBoxWidgetRevealed("Short contents")

        when: "click the sixth radio button"
        userTaskDetailsFragment.clickRadio(10)

        then: "verify nested checkBox widget is revealed"
        userTaskDetailsFragment.clickRadio(11)
        userTaskDetailsFragment.clickRadio(12)
        userTaskDetailsFragment.clickRadio(13)
        userTaskDetailsFragment.clickRadio(14)

        then: "click on continue"
        scrollEnd()
        userTaskDetailsButtonsFragment.clickUserTaskButton(CONTINUE)
    }

    def "test task: Check boxes"() {
        when: "verify title Task: Check boxes"
        userTaskDetailsFragment.getUserTaskTitle() == "Task: Check boxes"

        then: "verify there are 4 check boxes with labels"
        userTaskDetailsFragment.getCheckBoxes().size() == 4
        userTaskDetailsFragment.getCheckBoxLabel(0) == "FA"
        userTaskDetailsFragment.getCheckBoxLabel(1) == "Short label"
        userTaskDetailsFragment.getCheckBoxLabel(2) == "Medium Sized label"
        userTaskDetailsFragment.getCheckBoxLabel(3) == "Long label long label long label long label"

        then: "verify that the default options are selected and none of the others"
        userTaskDetailsFragment.checkIfAllOtherCheckboxesAreNotSelected(0, 3)

        and: "deselect the default options and select the other checkboxes"
        userTaskDetailsFragment.clickCheckBox()

        when: "verify that the default options are deselected and other checkboxes are checked"
        userTaskDetailsFragment.checkIfAllOtherCheckboxesAreNotSelected(1, 2)

        then: "select the default options and deselect the other checkboxes"
        userTaskDetailsFragment.clickCheckBox()

        and: "verify that the default options are selected and none of the others"
        userTaskDetailsFragment.checkIfAllOtherCheckboxesAreNotSelected(0, 3)

        then: "click on continue"
        userTaskDetailsButtonsFragment.clickUserTaskButton(CONTINUE)
    }

    def "test task: Check boxes with nesting"() {
        when: "verify title Task: Text inputs"
        userTaskDetailsFragment.getUserTaskTitle() == "Task: Checkboxes With Nesting"

        and: "verify there are 2 checkbox widgets"
        userTaskDetailsFragment.getCheckBoxLabel(0) == "Checkbox 1 exposes more detail"
        verifyNumberOfCheckBoxes(2)

        then: "click on the first top level check box"
        def firstCheckBox = userTaskDetailsFragment.getCheckBoxes().get(0)
        firstCheckBox.click()

        and: "verify contents of informational widget"
        userTaskDetailsFragment.getLabelDescription(0) == "Inner Header"
        userTaskDetailsFragment.getLabelDescription(1) == "This is short information."
        userTaskDetailsFragment.getLabelDescription(2) == "This is long information. This is long information. This is long information. This is long information. This is long information. This is long information. This is long information. This is long information."

        and: "verify there are 3 checkbox widgets"
        userTaskDetailsFragment.getCheckBoxLabel(1) == "Checkbox 2 exposes more detail"
        verifyNumberOfCheckBoxes(3)

        then: "click on the first nested check box"
        def firstNestedCheckBox = userTaskDetailsFragment.getCheckBoxes().get(1)
        firstNestedCheckBox.click()

        and: "verify there are 4 checkbox widgets"
        userTaskDetailsFragment.getCheckBoxLabel(2) == "Checkbox 3 exposes more detail"
        verifyNumberOfCheckBoxes(4)

        and: "verify contents of text widget"
      //  userTaskDetailsFragment.getLabelDescription(6) == "Text input 2"
        userTaskDetailsFragment.setFieldText(0, "Some text")
       // userTaskDetailsFragment.getLabelDescription(7) == "Regular expression validated text input"
        userTaskDetailsFragment.setFieldText(1, "Some text")

        then: "click on second nested checkbox"
        def secondNestedCheckBox = userTaskDetailsFragment.getCheckBoxes().get(2)
        secondNestedCheckBox.click()

        and: "verify there are 5 checkbox widgets"
        userTaskDetailsFragment.getCheckBoxLabel(3) == "Checkbox exposes more detail"
        verifyNumberOfCheckBoxes(5)

        and: "verify content of file input widget"
        instancesPage.selectFile(driver, "GAT-flow-package.zip")

        then: "click on third nested checkbox"
        def thirdNestedCheckBox = userTaskDetailsFragment.getCheckBoxes().get(3)
        thirdNestedCheckBox.click()

        and: "verify content of selectbox widget"
        userTaskDetailsFragment.selectBoxLabel == "Select box label"
        userTaskDetailsFragment.selectBoxValue == "Short contents"
        userTaskDetailsFragment.clickSelectBox()
        userTaskDetailsFragment.selectItemFromDropDown("Medium contents Medium contents Medium contents")
        userTaskDetailsFragment.selectBoxValue == "Medium contents Medium contents Medium contents"

        then: "click on second top level checkbox"
        def secondTopLevelCheckBox = userTaskDetailsFragment.getCheckBoxes().get(4)
        secondTopLevelCheckBox.click()

        and: "verify there are 6 checkbox widgets"
        userTaskDetailsFragment.getCheckBoxLabel(5) == "Checkbox 2 exposes more detail"
        verifyNumberOfCheckBoxes(6)

        then: "uncheck first top level checkbox"
        firstCheckBox.click()

        and: "uncheck second top level checkbox"
        secondTopLevelCheckBox.click()

        and: "verify there are 2 checkbox widgets"
        verifyNumberOfCheckBoxes(2)

        then: "select first top level checkbox"
        firstCheckBox.click()

        and: "select second top level checkbox"
        secondTopLevelCheckBox.click()

        and: "verify there are 6 checkbox widgets"
        verifyNumberOfCheckBoxes(6)

        and: "click on next inner checkbox"
        def innerCheckboxUnderSecondTopLevel = userTaskDetailsFragment.getCheckBoxes().get(5)
        innerCheckboxUnderSecondTopLevel.click()

        then: "verify radio buttons label and buttons"
        userTaskDetailsFragment.isLabelWidgetRevealed("Radio group label")
        userTaskDetailsFragment.clickRadio(7)
        userTaskDetailsFragment.clickRadio(8)
        userTaskDetailsFragment.clickRadio(9)
        userTaskDetailsFragment.clickRadio(6)
        //TODO modify mockServer to check the response object

        then: "click on continue"
        userTaskDetailsButtonsFragment.clickUserTaskButton(CONTINUE)
    }

    def "test Review and confirm"() {
        when: "verify title Task: Review with recursive"
        userTaskDetailsFragment.getUserTaskTitle() == "Task: Review and confirm"

        and:
        userTaskDetailsFragment.getAccordionTitle(0) == "Usertask Selection"
        userTaskDetailsFragment.getLabelName(0) == "Information"
        userTaskDetailsFragment.isLabelValueTrue(0)
        userTaskDetailsFragment.getLabelName(1) == "Text Inputs"
        userTaskDetailsFragment.isLabelValueTrue(1)
        userTaskDetailsFragment.getLabelName(2) == "Text Inputs With Information"
        userTaskDetailsFragment.isLabelValueTrue(2)
        userTaskDetailsFragment.getLabelName(3) == "Checkboxes"
        userTaskDetailsFragment.isLabelValueTrue(3)
        userTaskDetailsFragment.getLabelName(4) == "Radio Buttons"
        userTaskDetailsFragment.isLabelValueTrue(4)
        userTaskDetailsFragment.getLabelName(5) == "Selectboxes"
        userTaskDetailsFragment.isLabelValueTrue(5)
        userTaskDetailsFragment.getLabelName(6) == "File Selectors"
        userTaskDetailsFragment.isLabelValueTrue(6)
        userTaskDetailsFragment.getLabelName(7) == "Grouping And Nesting"
        userTaskDetailsFragment.isLabelValueTrue(7)
        userTaskDetailsFragment.getLabelName(8) == "Checkboxes With Nesting"
        userTaskDetailsFragment.isLabelValueTrue(8)
        userTaskDetailsFragment.getLabelName(9) == "Radio Buttons With Nesting"
        userTaskDetailsFragment.isLabelValueTrue(9)
        userTaskDetailsFragment.getAccordionTitle(1) == "Text Inputs"
        userTaskDetailsFragment.getLabelName(10) == "Text input with no length restrictions"
        userTaskDetailsFragment.getLabelValue(10) == "text input with no restrictions"
        userTaskDetailsFragment.getLabelName(11) == "Short text input"
        userTaskDetailsFragment.getLabelValue(11) == "short"
        userTaskDetailsFragment.getLabelName(12) == "Medium text input"
        userTaskDetailsFragment.getLabelValue(12) == "medium length text input"
        userTaskDetailsFragment.getLabelName(13) == "Long text input"
        userTaskDetailsFragment.getLabelValue(13) == "long text input long text input long text input long text input"
        userTaskDetailsFragment.getLabelName(14) == "Regular expression validated text input"
        userTaskDetailsFragment.getLabelValue(14) == "lowercase text"
        userTaskDetailsFragment.getLabelName(15) == "Optional text input"
        userTaskDetailsFragment.getLabelValue(15) == "optional text input"
        userTaskDetailsFragment.getLabelName(16) == "Text input with default"
        userTaskDetailsFragment.getLabelValue(16) == "text input with default"
        userTaskDetailsFragment.getLabelName(17) == "Text input with dynamic default"
        userTaskDetailsFragment.getLabelValue(17) == "text input with dynamic default"
        userTaskDetailsFragment.getAccordionTitle(2) == "Text Inputs With Information"
        userTaskDetailsFragment.getLabelName(18) == "This is long information. This is long information. This is long information. This is long information. This is long information. This is long information. This is long information. This is long information."
        userTaskDetailsFragment.getLabelName(19) == "Text input"
        userTaskDetailsFragment.getLabelValue(19) == "text input"
        userTaskDetailsFragment.getAccordionTitle(3) == "Select Boxes"
        userTaskDetailsFragment.getLabelName(20) == "Select box label"
        userTaskDetailsFragment.getLabelValue(20) == "Medium contents Medium contents Medium contents"
        userTaskDetailsFragment.getAccordionTitle(4) == "Radio Buttons"
        userTaskDetailsFragment.getLabelName(21) == "Radio group label"
        userTaskDetailsFragment.getLabelName(22) == "Short label"
        userTaskDetailsFragment.isLabelValueTrue(22)
        userTaskDetailsFragment.getAccordionTitle(5) == "Radio Buttons with nested checkbox revealing selectbox"
        userTaskDetailsFragment.getLabelName(23) == "Checkbox exposes more detail"
        userTaskDetailsFragment.isLabelValueTrue(23)
        userTaskDetailsFragment.getLabelName(24) == "Select box label"
        userTaskDetailsFragment.getLabelValue(24) == "Medium contents Medium contents Medium contents"
        userTaskDetailsFragment.getAccordionTitle(6) == "Radio Buttons with nested radio button"
        userTaskDetailsFragment.getLabelName(25) == "Radio group label"
        userTaskDetailsFragment.getLabelName(26) == "Medium Sized label"
        userTaskDetailsFragment.isLabelValueTrue(26)
        userTaskDetailsFragment.getAccordionTitle(7) == "File Selectors"
        userTaskDetailsFragment.getLabelName(27) == "File selector label"
        userTaskDetailsFragment.getLabelValue(27) == "foo.txt"
        userTaskDetailsFragment.getAccordionTitle(8) == "Check Boxes"
        userTaskDetailsFragment.getLabelName(28) == "FA"
        userTaskDetailsFragment.isLabelValueTrue(28)
        userTaskDetailsFragment.getLabelName(29) == "Short label"
        userTaskDetailsFragment.isLabelValueFalse(29)
        userTaskDetailsFragment.getLabelName(30) == "Medium Sized label"
        userTaskDetailsFragment.isLabelValueFalse(30)
        userTaskDetailsFragment.getLabelName(31) == "Long label long label long label long label"
        userTaskDetailsFragment.isLabelValueTrue(31)
        userTaskDetailsFragment.getAccordionTitle(9) == "Checkboxes With Nesting, nothing selected"
        userTaskDetailsFragment.getLabelName(32) == "Checkbox level 1 exposes more detail"
        userTaskDetailsFragment.isLabelValueFalse(32)
        userTaskDetailsFragment.getAccordionTitle(10) == "Checkboxes With Nesting, all selected"
        userTaskDetailsFragment.getLabelName(33) == "Checkbox level 1 exposes more detail"
        userTaskDetailsFragment.isLabelValueTrue(33)
        userTaskDetailsFragment.getLabelName(34) == "Checkbox level 2 exposes more detail"
        userTaskDetailsFragment.isLabelValueTrue(34)
        userTaskDetailsFragment.getLabelName(35) == "Text input 1"
        userTaskDetailsFragment.getLabelValue(35) == "text input"
        userTaskDetailsFragment.getLabelName(36) == "Checkbox with inner header"
        userTaskDetailsFragment.getLabelName(37) == "Checkbox with inner header"
        userTaskDetailsFragment.isLabelValueTrue(37)
        userTaskDetailsFragment.getLabelName(38) == "Checkbox with inner inner header"
        userTaskDetailsFragment.getLabelName(39) == "Checkbox level 2 exposes more detail"
        userTaskDetailsFragment.isLabelValueTrue(39)
        userTaskDetailsFragment.getLabelName(40) == "Text input 1"
        userTaskDetailsFragment.getLabelValue(40) == "text input"

        and: "verify if export button is visible"
        instanceDetailsPage.hasActionDropdown()

        and: "verify the name of the execute button"
        userTaskDetailsButtonsFragment.verifyNameFirstButton(EXECUTE_BUTTON)

        then: "Click on execute button"
        scrollEnd()
        userTaskDetailsButtonsFragment.clickUserTaskButton(EXECUTE_BUTTON)

        then: "verify confirm execution dialog box"
        instanceDetailsPage.isDialogBoxDisplayed()
        def instDeetsDialogFragment = instanceDetailsPage.dialogFragment
        instDeetsDialogFragment.getDialogBoxHeading() == CONFIRM_EXECUTION

        then: "click the cancel button"
        dialogFragment.clickActionButton(CANCEL)
    }

    private boolean verifyNumberOfCheckBoxes(expectedAmountOfCheckboxes) {
        def totalCheckboxes = 0
        for (checkBoxLabel in userTaskDetailsFragment.getCheckBoxLabels()) {
            if (checkBoxLabel.isDisplayed()) {
                totalCheckboxes += 1
            }
        }
        return totalCheckboxes == expectedAmountOfCheckboxes
    }
}


