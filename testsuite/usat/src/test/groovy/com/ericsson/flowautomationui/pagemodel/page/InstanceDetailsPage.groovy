package com.ericsson.flowautomationui.pagemodel.page

import com.ericsson.flowautomationui.pagemodel.fragment.FlowInstanceDetailsSummaryFragment
import com.ericsson.flowautomationui.pagemodel.fragment.FlowInstanceDetailsSummaryHeaderFragment
import com.ericsson.flowautomationui.pagemodel.fragment.RowFragment
import com.ericsson.flowautomationui.pagemodel.fragment.StartInstanceDialogFragment
import com.ericsson.flowautomationui.pagemodel.fragment.TableFragment
import com.ericsson.flowautomationui.pagemodel.fragment.UserTaskDetailsFragment
import com.ericsson.flowautomationui.pagemodel.fragment.reportfragments.ReportTabFragment
import com.ericsson.flowautomationui.pagemodel.fragment.reportfragments.ReportTextLineFragment
import com.ericsson.flowautomationui.pagemodel.fragment.reportfragments.SectionFragment
import org.jboss.arquillian.graphene.page.Page
import org.openqa.selenium.By
import org.openqa.selenium.WebDriver
import org.openqa.selenium.WebElement
import org.openqa.selenium.interactions.Actions
import org.openqa.selenium.support.FindBy

class InstanceDetailsPage extends BasePage {

    public static final String TITLE = "Flow Instance Details"

    @FindBy(className = "elTablelib-Table")
    TableFragment tableFragment

    @FindBy(className = "eaFlowInstanceDetails-rReportTab")
    private WebElement report

    @FindBy(className = "eaFlowInstanceDetails-rSection")
    List<SectionFragment> sectionFragments

    @FindBy(className = "ebTabs-tabItem_selected_true")
    private WebElement selectedTab

    @FindBy(className = "ebTabs-tabItem")
    private List<WebElement> tabs

    @FindBy(className = "ebTooltip")
    List<WebElement> tooltips

    @FindBy(className = "ebInlineMessage-header")
    private WebElement inlineMessage

    @FindBy(className = "eaFlowInstanceDetails-rProcessDiagramTab-actions-definition")
    private WebElement processDefinitionButton

    @FindBy(className = "eaFlowInstanceDetails-rProcessDiagramTab-actions-activity")
    private WebElement processActivityButton

    @FindBy(className = "elFlowAutomationLib-wProcessDefinitionDiagram-diagram-errorsection")
    private WebElement processDefinitionDiagramInlineMessage

    @FindBy(className = "elFlowAutomationLib-wProcessActivityDiagram-diagram-errorsection")
    private WebElement processActivityDiagramInlineMessage

    @FindBy(className = "eaFlowInstanceDetails-wUserTaskSummary-summaryData-list")
    FlowInstanceDetailsSummaryFragment flowInstanceDetailsSummaryFragment

    @FindBy(className = "eaFlowInstanceDetails-wUserTaskSummary-summary")
    FlowInstanceDetailsSummaryHeaderFragment flowInstanceDetailsSummaryHeaderFragment

    @FindBy(className = "elLayouts-ActionBarButton")
    List<WebElement> actionBarButtons

    @FindBy(className = "elLayouts-ActionBarDropdown")
    WebElement actionBarDropdown

    @FindBy(className = "ebDialog-holder")
    StartInstanceDialogFragment dialogFragment

    @FindBy(className = "eaFlowInstanceDetails-wfilter-filterTextBox-input")
    WebElement filterTextBox

    @FindBy(className = "ebDialogBox")
    private WebElement dialogBox

    @FindBy(className = "eaFlowInstanceDetails-rReportTab-actions-execution")
    WebElement reportExecutionButton

    @FindBy(className = "eaFlowInstanceDetails-rReportTab-actions-setupData")
    WebElement reportSetupButton

    @FindBy(className = "ebAccordion-title")
    WebElement setupDataTextAccordion

    @FindBy(className = "eaFlowInstanceDetails-wLabel-content-label")
    private List<WebElement> labelName

    @FindBy(className = "eaFlowInstanceDetails-rTextLine-name")
    private List<WebElement> testLineName

    @FindBy(className = "eaFlowInstanceDetails-rTable-topPanel-header")
    private List<WebElement> tableTopPanelHeader

    @FindBy(className = "ebTable-headerText")
    private List<WebElement> tableHeaderText

    @Page
    ReportTabFragment reportTabFragment

    @Page
    UserTaskDetailsFragment userTaskDetailsFragment

    @FindBy(className = "ebAccordion-title")
    private List<WebElement> accordions

    void clickReportExecutionButton() {
        click(reportExecutionButton)
    }

    void clickReportSetupButton() {
        click(reportSetupButton)
    }

    int getAmountOfSectionsInReport() {
        waitVisible(report)
        return sectionFragments.size()
    }

    String getInlineMessage() {
        return getText(inlineMessage)
    }

    String getProcessDefinitionDiagramInlineMessage() {
        waitVisible(processDefinitionDiagramInlineMessage)
        return getText(inlineMessage)
    }

    String getProcessActivityDiagramInlineMessage() {
        waitVisible(processActivityDiagramInlineMessage)
        return getText(inlineMessage)
    }

    void clickProcessDefinitionButton() {
        click(processDefinitionButton)
    }

    void clickProcessActivityButton() {
        click(processActivityButton)
    }

    boolean thereAreCorrectAmountOfTextLines(int sectionIndex, int textAreaIndex, int size) {
        return sectionFragments.get(sectionIndex).getTextArea(textAreaIndex).getLines().size() == size
    }

    WebElement getTextLine(int sectionIndex, int textAreaIndex, int lineNumber) {
        return sectionFragments.get(sectionIndex).getTextArea(textAreaIndex).getLines().get(lineNumber).getValue()
    }

    boolean valueOfALineIs(int sectionIndex, int textAreaIndex, int lineNumber, String name, String value, String href) {
        ReportTextLineFragment line = sectionFragments.get(sectionIndex).getTextArea(textAreaIndex).getLines().get(lineNumber)
        boolean nameIsCorrect = (name == line.getName().getText())
        boolean valueIsCorrect = (value == line.getValue().getText())
        boolean linkIfPresentIsCorrect = true
        if (href && line.getLink().getAttribute('href') != href) {
            linkIfPresentIsCorrect = false
        }
        if (nameIsCorrect && valueIsCorrect && linkIfPresentIsCorrect) {
            return true
        }
        return false
    }

    boolean tooltipIsCorrect(boolean shouldBePresent, String value) {
        Thread.sleep(1200)
        if (shouldBePresent) {
            return tooltips.get(0).getText() == value
        } else {
            return tooltips.size() == 0
        }
    }

    boolean thereAreCorrectAmountOfSummariesWithinAssertion(int sectionIndex, int size) {
        return sectionFragments.get(sectionIndex).summaries.size() == size
    }

    boolean theSummaryContainsTheCorrectValues(int sectionIndex, int summaryIndex, boolean link, int linkIndex, String[] values) {
        List<ReportTextLineFragment> summaryValues = sectionFragments.get(sectionIndex).getChart(summaryIndex).getSummaryValues()
        for (int i = 0; i < values.size(); i++) {
            if (!link) {
                if (values[i] != summaryValues[i].getValue().getText()) {
                    return false
                }
            } else if (link && linkIndex != i) {
                if (values[i] != summaryValues[i].getValue().getText()) {
                    return false
                }
            } else {
                if (values[i] != summaryValues[i].getLink().getText()) {
                    return false
                }
            }
        }
        return true
    }

    boolean theSummaryContainsTheCorrectNames(int sectionIndex, int chartIndex, String[] values) {
        List<ReportTextLineFragment> summaryValues = sectionFragments.get(sectionIndex).getChart(chartIndex).getSummaryValues()
        for (int i = 0; i < values.size(); i++) {
            if (values[i] != summaryValues[i].getName().getText()) {
                return false
            }
        }
        return true
    }

    WebElement getTableElement(int sectionIndex, int tableIndex) {
        return sectionFragments.get(sectionIndex).getReportTable(tableIndex).getTableHeader()
    }

    boolean theSummaryTitleIsCorrect(int sectionIndex, int summaryIndex, String value) {
        String summaryHeader = sectionFragments.get(sectionIndex).getChart(summaryIndex).getSummaryHeader().getText()
        if (summaryHeader != value) {
            return false
        }
        return true
    }

    boolean theTableTitleIsCorrect(int sectionIndex, int tableIndex, String value) {
        String tableHeader = sectionFragments.get(sectionIndex).getReportTable(tableIndex).getTableHeader().getText()
        if (tableHeader != value) {
            return false
        }
        return true
    }

    boolean switchTab(final int tabNumber1, final int tabNumber2) {
        isTabSelected(tabNumber1)
        isTabSelected(tabNumber2)
        return true
    }

    boolean isTabSelected(final int tabNumber) {
        sleep(5000) // Wait for tabs to appear
        String tabName = reportTabFragment.isTabSelected(tabNumber)
        if (tabNumber > 0) {
            System.out.println("Results: " + tabName + ": " + selectedTabIsCorrect(tabName))
            return true
        } else {
            System.err.println("No tabs available")
            return false
        }
    }

    boolean selectedTabIsCorrect(String tabName) {
        return getText(selectedTab).contains(tabName)
    }

    boolean correctVisibleTabs(String[] values) {
        waitVisible(selectedTab)
        for (int i = 0; i < tabs.size(); i++) {
            if (tabs[i].getText() != '') {
                if (tabs[i].getCssValue('display') != 'inline-block') {
                    return false
                }
            } else if (tabs[i].getCssValue('display') != 'none') {
                return false
            }
        }
        return true
    }

    RowFragment getReportTableRow(int sectionIndex, int tableIndex, int rowIndex) {
        return sectionFragments.get(sectionIndex)
                .reportTables.get(tableIndex).getTable()
                .getTableRows()[rowIndex]
    }

    boolean theTableRowIsCorrect(RowFragment row, boolean link, String linkValue, int linkIndex, String[] values) {
        List<WebElement> cells = row.getRowCells()
        for (int i = 0; i < values.size(); i++) {
            if (!link) {
                if (values[i] != cells[i].getText()) {
                    return false
                }
            } else if (link && linkIndex != i) {
                if (values[i] != cells[i].getText()) {
                    return false
                }
            } else {
                if (linkValue != null) {
                    WebElement linkElement = row.getLinkInCell()[0]
                    if (values[i] != linkElement.getText()) {
                        if (linkElement.getAttribute("href") != linkValue) {
                            return false
                        }
                    }
                } else {
                    WebElement linkElement = row.getNotSuppliedLink()
                    if (values[i] != linkElement.getText()) {
                        return false
                    }
                }
            }
        }
        return true
    }

    def isDataSorted(List<String> flowNamesDescendingList) {
        for (int i = 0; i < flowNamesDescendingList.size() - 2; i++) {
            if (flowNamesDescendingList[i].compareTo(flowNamesDescendingList[i + 1]) < 0) {
                return false
            }
        }
        return true
    }

    def compareSortedReportData(List<String> reportData) {
        return reportData == tableFragment.getColumnValues(2)
    }

    def applyFilter(String filterText, WebDriver driver) {
        Actions action = new Actions(driver)
        waitVisible(filterTextBox)
        action.moveToElement(filterTextBox)
        action.click()
        waitVisible(filterTextBox)
        filterTextBox.sendKeys(filterText)
    }

    boolean clickActionBar(name) {
        WebElement actionButton = null
        for (final WebElement button : actionBarButtons) {
            if (button.getText() == name) {
                actionButton = button
                break
            }
        }
        if (actionButton != null) {
            click(actionButton)
            return true
        } else {
            return false
        }
    }

    boolean isDialogBoxDisplayed() {
        return waitVisible(dialogBox).isDisplayed()
    }

    boolean isSetupDataAccordionDisplayed() {
        return setupDataTextAccordion.getText() == "Usertask Selection"
    }

    String getLabelName(int index) {
        return getText(labelName.get(index))
    }

    List<WebElement> getLabelNames() {
        return waitVisible(labelName)
    }

    String getTextLineName(int index) {
        return getText(testLineName.get(index))
    }

    String getTableTopPanelHeader(int index) {
        return getText(tableTopPanelHeader.get(index))
    }

    String getTableHeaderText(int index) {
        return getText(tableHeaderText.get(index))
    }

    boolean hasActionDropdown() {
        waitVisible(actionBarDropdown).isDisplayed()
    }

    WebElement getPopupTableOnDialogBox() {
        return dialogBox.findElement(By.className("eaFlowInstanceDetails-wPopupTable"))
    }

    WebElement getErrorOnDialogBox() {
        getPopupTableOnDialogBox().findElement(By.className("eaFlowInstanceDetails-wPopupTable-error"))
    }

    boolean isErrorOnDialogBoxHidden() {
        return getErrorOnDialogBox().getCssValue('display') == 'none'
    }

    boolean isErrorOnDialogBoxShown() {
        return getErrorOnDialogBox().getCssValue('display') == 'block'
    }

    void selectAndDeselectFirstRowOnDialogBox() {
        WebElement firstCell = getPopupTableOnDialogBox().findElement(By.className("elTablelib-Table-body"))
                .findElements(By.className("ebTableRow")).first()
                .findElements(By.className("ebTableCell")).first()
        firstCell.click()
        sleep(500)
        firstCell.click()
    }

    void selectFirstRowOnDialogBox() {
        getPopupTableOnDialogBox().findElement(By.className("elTablelib-Table-body"))
                .findElements(By.className("ebTableRow")).first()
                .findElements(By.className("ebTableCell")).first().click()
    }

    WebElement getOkButtonOnDialogBox() {
        return dialogBox.findElement(By.className("ebDialogBox-actionBlock")).findElements(By.className("ebBtn")).first()
    }

    def selectTabByName(tabName) {
        for (WebElement tab : tabs) {
            if (getText(tab) == tabName) {
                click(tab)
                break
            }
        }
    }

    def getAccordionTitle(index) {
        return accordions.get(index).text.trim()
    }
}