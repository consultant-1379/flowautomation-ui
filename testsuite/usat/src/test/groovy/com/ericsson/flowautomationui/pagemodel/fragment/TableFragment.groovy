package com.ericsson.flowautomationui.pagemodel.fragment

import org.jboss.arquillian.graphene.findby.FindByJQuery
import org.openqa.selenium.By
import org.openqa.selenium.WebDriver
import org.openqa.selenium.WebElement
import org.openqa.selenium.interactions.Actions
import org.openqa.selenium.support.FindBy

class TableFragment extends BaseFragment {

    @FindBy(className = "elTablelib-Table-body")
    private WebElement table

    @FindBy(className = "ebSort-arrow_down")
    private WebElement sortIcon

    @FindByJQuery("tr > td:first-child")
    private List<WebElement> firstColumnValues

    @FindByJQuery("tr > td:nth-child(2)")
    private List<WebElement> secondColumnValues

    @FindBy(className = "ebTable-headerText")
    private List<WebElement> columns

    @FindBy(className = "ebTableRow")
    private List<RowFragment> tableRows

    @FindBy(className = "ebTableRow_highlighted")
    private RowFragment selectedRow

    @FindByJQuery("table > thead > tr > th:nth-child(2) > div.ebTable-header > span.ebTable-headerSort.ebSort > i.ebSort-arrow_up")
    WebElement SecondColumnAscendingSortIcon

    @FindBy(css = ".elTablelib-Table-body .ebTableRow")
    private List<RowFragment> tableBodyRows

    int getColumnIndex(String column) {
        return columns.findIndexOf { col -> col.getText().trim() == column }
    }

    WebElement getTable() {
        return waitVisible(table)
    }

    List<RowFragment> getAllTableBodyRows() {
        return tableBodyRows
    }

    List<RowFragment> getTableRows() {
        return tableRows
    }

    def getSelectedRow() {
        return selectedRow
    }

    int getRowWithColumnHeaderAndValue(String columnName, String columnValue) {
        int columnIndex = getColumnIndex(columnName)
        if (columnIndex != -1) {
            int rowIndex = getTableRows().findIndexOf { row ->
                def cells = row.getRowCells()
                cells.size() > 0 && cells.get(columnIndex).text.trim() == columnValue
            }
            return rowIndex
        }
        return -1
    }

    boolean selectRow(String cellValue) {
        for (RowFragment row : getTableRows()) {
            for (WebElement cell : row.getRowCells()) {
                if (cellValue == cell.getText().trim()) {
                    click(cell)
                    sleep(500)
                    return true
                }
            }
        }
        return false
    }

    void clickRow(int index) {
        getTableRows().get(index).clickRow()
    }

    boolean dblClickRow(WebDriver webDriver, String cellValue) {
        for (RowFragment row : getTableRows()) {
            for (WebElement cell : row.getRowCells()) {
                if (cellValue == cell.getText().trim()) {
                    row.dblClickRow(webDriver)
                    return true
                }
             }
        }
        return false
    }

    void dblClickRow(WebDriver webDriver, int index) {
        getTableRows().get(index).dblClickRow(webDriver)
    }

    void clickTableBodyRow(int index) {
        getAllTableBodyRows().get(index).clickRow()
    }

    String getCellValue(int rowIndex, int cellIndex) {
        return getAllTableBodyRows().get(rowIndex).getRowCells().get(cellIndex).getText()
    }

    boolean cellHasNewValueAfterTenSeconds(int rowIndex, int cellIndex) {
        String firstCellValue = getCellValue(rowIndex, cellIndex)
        //The refresh occurs every 10 seconds
        sleep(11000)
        String secondCellValue = getCellValue(rowIndex, cellIndex)
        return !firstCellValue == secondCellValue
    }

    boolean checkPolling(int rowIndex, int cellIndex) {
        int noOfRowsBeforePolling = getAllTableBodyRows().size()
        sleep(11000)
        String firstCellValue = getCellValue(rowIndex, cellIndex)

        //The refresh occurs every 10 seconds
        sleep(11000)
        String secondCellValue = getCellValue(rowIndex, cellIndex)
        int noOfRowsAfterPolling = getAllTableBodyRows().size()
        if (noOfRowsBeforePolling == noOfRowsAfterPolling) {
            return !firstCellValue == secondCellValue
        } else {
            return false
        }
    }

    def rightClickRow(WebDriver webDriver, int rowIndex) {
        sleep(500)
        Actions action = new Actions(webDriver)
        WebElement element = getAllTableBodyRows().get(rowIndex).returnClickableCell()
        action.contextClick(element).perform()
    }

    def clickContextMenuItem(WebDriver webDriver, String contextMenuAction) {
        final WebElement contextMenuItem = webDriver.findElement(
                By.xpath("//div[contains(text(), '" + contextMenuAction + "') and contains(@class, 'ebComponentList-item')]"))
        click(contextMenuItem)
    }


    def getColumnValues(int columnNumber) {
        if (columnNumber == 1) {
            return firstColumnValues.collect { it -> it.getText() }
        } else if (columnNumber == 2) {
            return secondColumnValues.collect { it -> it.getText() }
        }
    }

    def getFirstColumnValuesInDescendingOrder() {
        return getColumnValues(1).reverse()
    }

    def getSecondColumnValuesInAscendingOrder() {
        return getColumnValues(2).sort()
    }

    def sortDescending() {
        click(sortIcon)
    }

    def sortColumnInAscendingOrder(int columnNumber) {
        if (columnNumber == 2) {
            click(SecondColumnAscendingSortIcon)
        }
    }

    def getTableColumns() {
        return columns.collect { it -> it.getText() }
    }

    def compareFilteredRows(String filterText) {
        if (getAllTableBodyRows().size() > 0) {
            getAllTableBodyRows().each { RowFragment row ->
                def containsText = false
                for (WebElement cell : row.getRowCells()) {
                    if (cell.getText().trim().toLowerCase().contains(filterText.toLowerCase())) {
                        containsText = true
                        break
                    }
                }
                if (!containsText) {
                    return false
                }
            }
        }

        return true
    }
}